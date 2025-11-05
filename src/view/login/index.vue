<script lang="ts">
export const description = '用于登录 UltiCode 管理控制台的表单页面。'
</script>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import { GalleryVerticalEnd, Loader2 } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuthStore } from '@/stores/auth'

interface LoginFormState {
  identifier: string
  password: string
}

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const form = reactive<LoginFormState>({
  identifier: '',
  password: '',
})

const loading = ref(false)
const errorMessage = ref<string | null>(null)

const redirectTarget = computed(() => {
  const redirect = route.query.redirect
  if (typeof redirect === 'string' && redirect.length > 0) {
    return redirect
  }
  return '/main'
})

function resetError() {
  errorMessage.value = null
}

async function handleSubmit() {
  if (loading.value) {
    return
  }
  resetError()
  if (!form.identifier.trim()) {
    errorMessage.value = '请输入用户名或邮箱'
    return
  }
  if (!form.password) {
    errorMessage.value = '请输入密码'
    return
  }
  loading.value = true
  try {
    await authStore.login({
      identifier: form.identifier.trim(),
      password: form.password,
    })
    await router.replace(redirectTarget.value)
  } catch (error) {
    if (error instanceof Error) {
      errorMessage.value = error.message || '登录失败，请稍后再试'
    } else {
      errorMessage.value = '登录失败，请稍后再试'
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="grid min-h-svh lg:grid-cols-2">
    <div class="flex flex-col gap-6 p-6 md:p-10">
      <div class="flex justify-center gap-2 md:justify-start">
        <RouterLink class="flex items-center gap-2 font-medium" to="/">
          <div
            class="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground"
          >
            <GalleryVerticalEnd class="size-4" />
          </div>
          UltiCode
        </RouterLink>
      </div>
      <div class="flex flex-1 items-center justify-center">
        <div class="w-full max-w-sm">
          <form class="flex flex-col gap-6" @submit.prevent="handleSubmit">
            <div class="flex flex-col gap-2 text-center">
              <h1 class="text-2xl font-bold">欢迎回来</h1>
              <p class="text-muted-foreground text-sm">使用注册时的邮箱或用户名登录 UltiCode</p>
            </div>

            <div
              v-if="errorMessage"
              class="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive"
            >
              {{ errorMessage }}
            </div>

            <div class="grid gap-4">
              <div class="grid gap-2 text-left">
                <Label for="login-identifier">邮箱或用户名</Label>
                <Input
                  id="login-identifier"
                  v-model="form.identifier"
                  autocomplete="username"
                  placeholder="example@ulticode.dev"
                  type="text"
                  @input="resetError"
                />
              </div>
              <div class="grid gap-2 text-left">
                <Label for="login-password">密码</Label>
                <Input
                  id="login-password"
                  v-model="form.password"
                  autocomplete="current-password"
                  type="password"
                  @input="resetError"
                />
              </div>
              <Button :disabled="loading" type="submit">
                <Loader2 v-if="loading" class="mr-2 size-4 animate-spin" />
                登录
              </Button>
            </div>

            <p class="text-center text-sm text-muted-foreground">
              还没有账号？
              <RouterLink
                :to="{
                  name: 'register',
                  query: route.query.redirect ? { redirect: route.query.redirect } : undefined,
                }"
                class="underline underline-offset-4"
              >
                立即注册
              </RouterLink>
            </p>
          </form>
        </div>
      </div>
    </div>
    <div class="relative hidden bg-muted lg:block">
      <img
        src="https://www.shadcn-vue.com/placeholder.svg"
        alt="登录背景图"
        class="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
      />
    </div>
  </div>
</template>
