<script lang="ts">
export const description = '注册新的 UltiCode 账户。'
</script>

<script lang="ts" setup>
import {computed, onBeforeUnmount, reactive, ref} from 'vue'
import {useRoute, useRouter, RouterLink} from 'vue-router'
import {GalleryVerticalEnd, Loader2, Mail, ShieldCheck} from 'lucide-vue-next'
import {Button} from '@/components/ui/button'
import {Input} from '@/components/ui/input'
import {Label} from '@/components/ui/label'
import {useAuthStore} from '@/stores/auth'
import {requestRegistrationCode} from '@/api/auth/auth'

interface RegisterFormState {
  username: string
  email: string
  password: string
  confirmPassword: string
  verificationCode: string
}

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const form = reactive<RegisterFormState>({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  verificationCode: '',
})

const loading = ref(false)
const sendingCode = ref(false)
const countdown = ref(0)
const errorMessage = ref<string | null>(null)
const noticeMessage = ref<string | null>(null)

let countdownTimer: ReturnType<typeof setInterval> | null = null

const redirectTarget = computed(() => {
  const redirect = route.query.redirect
  if (typeof redirect === 'string' && redirect.length > 0) {
    return redirect
  }
  return '/main'
})

function clearCountdown() {
  if (countdownTimer !== null) {
    clearInterval(countdownTimer)
    countdownTimer = null
  }
}

function startCountdown(seconds: number) {
  countdown.value = seconds
  clearCountdown()
  countdownTimer = setInterval(() => {
    countdown.value -= 1
    if (countdown.value <= 0) {
      countdown.value = 0
      clearCountdown()
    }
  }, 1000)
}

function resetFeedback() {
  errorMessage.value = null
  noticeMessage.value = null
}

function validateEmail(email: string) {
  const emailPattern =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/
  return emailPattern.test(email)
}

async function handleSendCode() {
  if (sendingCode.value || countdown.value > 0) {
    return
  }
  resetFeedback()
  const email = form.email.trim()
  if (!email) {
    errorMessage.value = '请输入邮箱地址'
    return
  }
  if (!validateEmail(email)) {
    errorMessage.value = '邮箱格式不正确'
    return
  }
  sendingCode.value = true
  try {
    await requestRegistrationCode({email})
    noticeMessage.value = '验证码已发送，请注意查收邮件'
    startCountdown(60)
  } catch (error) {
    if (error instanceof Error) {
      errorMessage.value = error.message || '验证码发送失败，请稍后再试'
    } else {
      errorMessage.value = '验证码发送失败，请稍后再试'
    }
  } finally {
    sendingCode.value = false
  }
}

async function handleSubmit() {
  if (loading.value) {
    return
  }
  resetFeedback()
  if (!form.username.trim()) {
    errorMessage.value = '请输入用户名'
    return
  }
  if (!validateEmail(form.email.trim())) {
    errorMessage.value = '请输入有效的邮箱地址'
    return
  }
  if (form.password.length < 6) {
    errorMessage.value = '密码长度至少需要 6 位'
    return
  }
  if (form.password !== form.confirmPassword) {
    errorMessage.value = '两次输入的密码不一致'
    return
  }
  if (!form.verificationCode.trim()) {
    errorMessage.value = '请输入邮箱验证码'
    return
  }
  loading.value = true
  try {
    await authStore.register({
      username: form.username.trim(),
      email: form.email.trim(),
      password: form.password,
      verificationCode: form.verificationCode.trim(),
    })
    noticeMessage.value = '注册成功，正在为您跳转...'
    await router.replace(redirectTarget.value)
  } catch (error) {
    if (error instanceof Error) {
      errorMessage.value = error.message || '注册失败，请稍后再试'
    } else {
      errorMessage.value = '注册失败，请稍后再试'
    }
  } finally {
    loading.value = false
  }
}

onBeforeUnmount(() => {
  clearCountdown()
})
</script>

<template>
  <div class="grid min-h-svh lg:grid-cols-2">
    <div class="flex flex-col gap-6 p-6 md:p-10">
      <div class="flex justify-center gap-2 md:justify-start">
        <RouterLink class="flex items-center gap-2 font-medium" to="/">
          <div
            class="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground"
          >
            <GalleryVerticalEnd class="size-4"/>
          </div>
          UltiCode
        </RouterLink>
      </div>
      <div class="flex flex-1 items-center justify-center">
        <div class="w-full max-w-lg">
          <form class="flex flex-col gap-6" @submit.prevent="handleSubmit">
            <div class="flex flex-col gap-2 text-center">
              <h1 class="text-2xl font-bold">创建你的账户</h1>
              <p class="text-muted-foreground text-sm">
                绑定邮箱、设置密码，并完成验证即可开始使用 UltiCode
              </p>
            </div>

            <div v-if="errorMessage"
                 class="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
              {{ errorMessage }}
            </div>
            <div
              v-else-if="noticeMessage"
              class="rounded-md border border-primary/40 bg-primary/10 p-3 text-sm text-primary"
            >
              {{ noticeMessage }}
            </div>

            <div class="grid gap-4">
              <div class="grid gap-2 text-left">
                <Label for="register-username">用户名</Label>
                <Input
                  id="register-username"
                  v-model="form.username"
                  autocomplete="username"
                  placeholder="输入昵称或真实姓名"
                />
              </div>
              <div class="grid gap-2 text-left">
                <Label for="register-email">邮箱</Label>
                <div class="flex gap-2">
                  <Input
                    id="register-email"
                    v-model="form.email"
                    autocomplete="email"
                    placeholder="you@ulticode.dev"
                    type="email"
                  />
                  <Button
                    :disabled="sendingCode || countdown > 0"
                    class="whitespace-nowrap"
                    type="button"
                    variant="outline"
                    @click="handleSendCode"
                  >
                    <Loader2 v-if="sendingCode" class="mr-2 size-4 animate-spin"/>
                    <template v-else>
                      <Mail class="mr-2 size-4"/>
                      {{ countdown > 0 ? `${countdown}s` : '发送验证码' }}
                    </template>
                  </Button>
                </div>
              </div>
              <div class="grid gap-2 text-left">
                <Label for="register-password">密码</Label>
                <Input
                  id="register-password"
                  v-model="form.password"
                  autocomplete="new-password"
                  placeholder="至少 6 位，推荐包含大小写字母及数字"
                  type="password"
                />
              </div>
              <div class="grid gap-2 text-left">
                <Label for="register-confirm-password">确认密码</Label>
                <Input
                  id="register-confirm-password"
                  v-model="form.confirmPassword"
                  autocomplete="new-password"
                  placeholder="再次输入密码"
                  type="password"
                />
              </div>
              <div class="grid gap-2 text-left">
                <Label for="register-code">邮箱验证码</Label>
                <Input
                  id="register-code"
                  v-model="form.verificationCode"
                  autocomplete="one-time-code"
                  placeholder="请输入邮件中的 6 位验证码"
                />
              </div>
              <Button :disabled="loading" type="submit">
                <Loader2 v-if="loading" class="mr-2 size-4 animate-spin"/>
                <ShieldCheck v-else class="mr-2 size-4"/>
                完成注册
              </Button>
            </div>

            <p class="text-center text-sm text-muted-foreground">
              已经有账号？
              <RouterLink
                :to="{ name: 'login', query: route.query.redirect ? { redirect: route.query.redirect } : undefined }"
                class="underline underline-offset-4"
              >
                返回登录
              </RouterLink>
            </p>
          </form>
        </div>
      </div>
    </div>
    <div class="relative hidden bg-muted lg:block">
      <img
        alt="注册背景图"
        src="https://www.shadcn-vue.com/placeholder.svg"
        class="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
      />
    </div>
  </div>
</template>
