<script setup lang="ts">
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
</script>

<template>
  <div class="container mx-auto max-w-4xl space-y-6 p-6">
    <div class="space-y-2">
      <h1 class="text-3xl font-bold tracking-tight">Community Guidelines</h1>
      <p class="text-muted-foreground">
        Please read and follow these guidelines to keep our community welcoming
        and productive.
      </p>
    </div>

    <Card>
      <CardHeader>
        <CardTitle>1. Be Respectful and Professional</CardTitle>
      </CardHeader>
      <CardContent class="space-y-2 text-sm">
        <p>
          Treat all community members with respect. Personal attacks,
          harassment, discrimination, or hateful language will not be tolerated.
        </p>
        <p>
          Remember that behind every username is a real person who deserves
          courtesy and consideration.
        </p>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle>2. Stay On Topic</CardTitle>
      </CardHeader>
      <CardContent class="space-y-2 text-sm">
        <p>
          Keep discussions relevant to the category or community you're posting
          in. Interview experiences belong in Interview, career advice in
          Career, etc.
        </p>
        <p>
          Off-topic posts may be moved or removed to maintain organization and
          discoverability.
        </p>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle>3. No Spam or Self-Promotion</CardTitle>
      </CardHeader>
      <CardContent class="space-y-2 text-sm">
        <p>
          Don't post repetitive content, advertisements, or excessive
          self-promotion. Share your projects or content when relevant, but
          don't spam the community.
        </p>
        <p>Affiliate links and commercial solicitation are not allowed.</p>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle>4. Protect Privacy</CardTitle>
      </CardHeader>
      <CardContent class="space-y-2 text-sm">
        <p>
          Don't share personal information (yours or others') such as phone
          numbers, addresses, or private messages without consent.
        </p>
        <p>
          When discussing interviews or companies, you may share your
          experiences but avoid naming specific interviewers or disclosing
          confidential information.
        </p>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle>5. Use Appropriate Language</CardTitle>
      </CardHeader>
      <CardContent class="space-y-2 text-sm">
        <p>
          Keep language professional and appropriate. Excessive profanity, NSFW
          content, or inappropriate jokes are not allowed.
        </p>
        <p>Use clear, constructive communication in all interactions.</p>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle>6. Give Credit Where Due</CardTitle>
      </CardHeader>
      <CardContent class="space-y-2 text-sm">
        <p>
          When sharing code, solutions, or ideas from others, always provide
          proper attribution. Plagiarism is not acceptable.
        </p>
        <p>
          If you're building on someone else's work, acknowledge it and explain
          your contributions.
        </p>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle>7. Report Issues Appropriately</CardTitle>
      </CardHeader>
      <CardContent class="space-y-2 text-sm">
        <p>
          If you see content that violates these guidelines, use the report
          feature rather than engaging in arguments.
        </p>
        <p>
          The moderation team will review all reports and take appropriate
          action.
        </p>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle>8. Constructive Feedback Only</CardTitle>
      </CardHeader>
      <CardContent class="space-y-2 text-sm">
        <p>
          When providing feedback on code or solutions, be constructive and
          helpful. Focus on the work, not the person.
        </p>
        <p>
          If you disagree with someone, explain your reasoning respectfully and
          be open to discussion.
        </p>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle>Enforcement</CardTitle>
      </CardHeader>
      <CardContent class="space-y-2 text-sm">
        <p>
          Violations of these guidelines may result in warnings, temporary
          suspensions, or permanent bans depending on the severity and
          frequency.
        </p>
        <p>
          The moderation team has final discretion on all enforcement decisions.
        </p>
      </CardContent>
    </Card>

    <div class="rounded-lg border bg-muted/50 p-4 text-sm">
      <p class="font-medium">Questions about these guidelines?</p>
      <p class="mt-2 text-muted-foreground">
        If you have questions or concerns about these guidelines, please visit
        our
        <router-link to="/forum/feedback" class="text-primary hover:underline">
          Feedback
        </router-link>
        page or contact the moderation team.
      </p>
    </div>
  </div>
</template>
