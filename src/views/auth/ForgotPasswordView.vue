<script setup lang="ts">
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ref } from "vue";
import { useRouter } from "vue-router";
import { forgotPassword } from "@/api/auth";
import { toast } from "vue-sonner";
import { GalleryVerticalEnd } from "lucide-vue-next";

const router = useRouter();
const email = ref("");
const loading = ref(false);

async function handleReset(e: Event) {
  e.preventDefault();
  loading.value = true;
  try {
    await forgotPassword(email.value);
    toast.success("If an account exists, a reset link has been sent.");
    router.push("/login");
  } catch (error) {
    console.error(error);
    toast.error("Failed to process request");
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="grid min-h-svh lg:grid-cols-2">
    <div class="flex flex-col gap-4 p-6 md:p-10">
      <div class="flex justify-center gap-2 md:justify-start">
        <a href="#" class="flex items-center gap-2 font-medium">
          <div
            class="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md"
          >
            <GalleryVerticalEnd class="size-4" />
          </div>
          UltiCode
        </a>
      </div>
      <div class="flex flex-1 items-center justify-center">
        <div class="w-full max-w-xs">
          <form class="flex flex-col gap-6" @submit="handleReset">
            <div class="flex flex-col items-center gap-1 text-center">
              <h1 class="text-2xl font-bold">Forgot Password</h1>
              <p class="text-muted-foreground text-sm text-balance">
                Enter your email to receive a reset link
              </p>
            </div>
            <div class="grid gap-2">
              <Label for="email">Email</Label>
              <Input
                id="email"
                type="email"
                v-model="email"
                placeholder="m@example.com"
                required
              />
            </div>
            <Button type="submit" :disabled="loading">
              {{ loading ? "Sending..." : "Send Reset Link" }}
            </Button>
            <div class="text-center text-sm">
              Remember your password?
              <a href="/login" class="underline underline-offset-4">Login</a>
            </div>
          </form>
        </div>
      </div>
    </div>
    <div class="bg-muted relative hidden lg:block">
      <img
        src="https://images.unsplash.com/photo-1590069261209-f8e9b8642343?ixlib=rb-4.0.3&auto=format&fit=crop&w=1376&q=80"
        alt="Image"
        class="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
      />
    </div>
  </div>
</template>
