<script setup lang="ts">
import { ref } from "vue";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "vue-sonner";

const feedbackType = ref<string>("bug");
const subject = ref("");
const description = ref("");
const isSubmitting = ref(false);

const feedbackTypes = [
  { value: "bug", label: "Bug Report" },
  { value: "feature", label: "Feature Request" },
  { value: "improvement", label: "Improvement Suggestion" },
  { value: "content", label: "Content Issue" },
  { value: "other", label: "Other" },
];

async function submitFeedback() {
  if (!subject.value.trim() || !description.value.trim()) {
    toast.error("Please fill in all required fields.");
    return;
  }

  isSubmitting.value = true;

  try {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    toast.success("Feedback submitted. Thank you!");

    // Reset form
    subject.value = "";
    description.value = "";
    feedbackType.value = "bug";
  } catch {
    toast.error("Failed to submit feedback. Please try again.");
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<template>
  <div
    class="max-w-7xl mx-auto w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10 px-4 py-8"
  >
    <div class="space-y-2">
      <h1 class="text-3xl font-bold tracking-tight">Feedback & Support</h1>
      <p class="text-muted-foreground text-lg">
        Help us improve UltiCode by sharing your feedback, reporting bugs, or
        suggesting new features.
      </p>
    </div>

    <Separator />

    <div class="grid gap-8 md:grid-cols-3">
      <Card class="md:col-span-2 border-none shadow-sm bg-muted/20">
        <CardHeader>
          <CardTitle>Submit Feedback</CardTitle>
        </CardHeader>
        <CardContent>
          <form @submit.prevent="submitFeedback" class="space-y-6">
            <div class="space-y-2">
              <Label for="feedback-type">Feedback Type *</Label>
              <Select v-model="feedbackType">
                <SelectTrigger id="feedback-type" class="bg-background">
                  <SelectValue placeholder="Select feedback type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    v-for="type in feedbackTypes"
                    :key="type.value"
                    :value="type.value"
                  >
                    {{ type.label }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div class="space-y-2">
              <Label for="subject">Subject *</Label>
              <Input
                id="subject"
                v-model="subject"
                placeholder="Brief description of your feedback"
                required
                class="bg-background"
              />
            </div>

            <div class="space-y-2">
              <Label for="description">Description *</Label>
              <Textarea
                id="description"
                v-model="description"
                placeholder="Please provide as much detail as possible..."
                rows="8"
                required
                class="bg-background resize-none"
              />
              <p class="text-xs text-muted-foreground">
                For bug reports, please include steps to reproduce the issue.
              </p>
            </div>

            <Button
              type="submit"
              :disabled="isSubmitting"
              class="w-full h-11 rounded-full text-base font-bold"
            >
              <span v-if="isSubmitting">Submitting...</span>
              <span v-else>Submit Feedback</span>
            </Button>
          </form>
        </CardContent>
      </Card>

      <div class="space-y-6">
        <Card class="border-none shadow-sm bg-muted/20">
          <CardHeader>
            <CardTitle class="text-base font-black uppercase tracking-widest"
              >Quick Links</CardTitle
            >
          </CardHeader>
          <CardContent class="space-y-4 text-sm">
            <div class="group">
              <router-link
                to="/forum/guidelines"
                class="text-primary hover:underline font-bold"
              >
                Community Guidelines
              </router-link>
              <p class="mt-1 text-xs text-muted-foreground">
                Read our community rules
              </p>
            </div>
            <div class="group">
              <router-link
                to="/forum"
                class="text-primary hover:underline font-bold"
              >
                Forum Home
              </router-link>
              <p class="mt-1 text-xs text-muted-foreground">
                Back to discussions
              </p>
            </div>
          </CardContent>
        </Card>

        <Card class="border-none shadow-sm bg-muted/20">
          <CardHeader>
            <CardTitle class="text-base font-black uppercase tracking-widest"
              >Common Issues</CardTitle
            >
          </CardHeader>
          <CardContent class="space-y-4 text-xs">
            <div>
              <p class="font-bold text-foreground/80">Can't submit code?</p>
              <p class="text-muted-foreground leading-relaxed">
                Check your code syntax and try refreshing the page.
              </p>
            </div>
            <div>
              <p class="font-bold text-foreground/80">Login problems?</p>
              <p class="text-muted-foreground leading-relaxed">
                Try clearing your browser cache or resetting your password.
              </p>
            </div>
            <div>
              <p class="font-bold text-foreground/80">Missing features?</p>
              <p class="text-muted-foreground leading-relaxed">
                Submit a feature request using the form!
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
</template>
