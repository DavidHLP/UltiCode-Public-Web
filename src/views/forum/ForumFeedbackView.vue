<script setup lang="ts">
import { ref } from "vue";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
    toast({
      title: "Validation Error",
      description: "Please fill in all required fields.",
      variant: "destructive",
    });
    return;
  }

  isSubmitting.value = true;

  try {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    toast({
      title: "Feedback Submitted",
      description:
        "Thank you for your feedback! We'll review it and get back to you if needed.",
    });

    // Reset form
    subject.value = "";
    description.value = "";
    feedbackType.value = "bug";
  } catch {
    toast({
      title: "Submission Failed",
      description: "Something went wrong. Please try again later.",
      variant: "destructive",
    });
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<template>
  <div class="container mx-auto max-w-4xl space-y-6 p-6">
    <div class="space-y-2">
      <h1 class="text-3xl font-bold tracking-tight">Feedback & Support</h1>
      <p class="text-muted-foreground">
        Help us improve UltiCode by sharing your feedback, reporting bugs, or
        suggesting new features.
      </p>
    </div>

    <div class="grid gap-6 md:grid-cols-3">
      <Card class="md:col-span-2">
        <CardHeader>
          <CardTitle>Submit Feedback</CardTitle>
        </CardHeader>
        <CardContent>
          <form @submit.prevent="submitFeedback" class="space-y-4">
            <div class="space-y-2">
              <Label for="feedback-type">Feedback Type *</Label>
              <Select v-model="feedbackType">
                <SelectTrigger id="feedback-type">
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
              />
              <p class="text-xs text-muted-foreground">
                For bug reports, please include steps to reproduce the issue.
              </p>
            </div>

            <Button type="submit" :disabled="isSubmitting" class="w-full">
              {{ isSubmitting ? "Submitting..." : "Submit Feedback" }}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div class="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle class="text-base">Quick Links</CardTitle>
          </CardHeader>
          <CardContent class="space-y-3 text-sm">
            <div>
              <router-link
                to="/forum/guidelines"
                class="text-primary hover:underline"
              >
                Community Guidelines
              </router-link>
              <p class="mt-1 text-xs text-muted-foreground">
                Read our community rules
              </p>
            </div>
            <div>
              <router-link to="/forum" class="text-primary hover:underline">
                Forum Home
              </router-link>
              <p class="mt-1 text-xs text-muted-foreground">
                Back to discussions
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle class="text-base">Common Issues</CardTitle>
          </CardHeader>
          <CardContent class="space-y-2 text-xs">
            <div>
              <p class="font-medium">Can't submit code?</p>
              <p class="text-muted-foreground">
                Check your code syntax and try refreshing the page.
              </p>
            </div>
            <div class="mt-3">
              <p class="font-medium">Login problems?</p>
              <p class="text-muted-foreground">
                Try clearing your browser cache or resetting your password.
              </p>
            </div>
            <div class="mt-3">
              <p class="font-medium">Missing features?</p>
              <p class="text-muted-foreground">
                Submit a feature request using the form!
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
</template>
