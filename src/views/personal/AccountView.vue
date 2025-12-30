<script setup lang="ts">
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import PersonalPageHeader from "./components/PersonalPageHeader.vue";
import PersonalPageShell from "./components/PersonalPageShell.vue";
import { toast } from "vue-sonner";
import {
  User,
  Lock,
  Bell,
  Globe,
  Mail,
  MapPin,
  Twitter,
  Github,
  Loader2,
  ShieldCheck,
} from "lucide-vue-next";
import {
  fetchUserProfile,
  updateUserProfile,
  type UserProfile,
} from "@/api/user";
import { fetchCurrentUserId } from "@/utils/auth";
import { onMounted, ref } from "vue";

const loading = ref(true);
const saving = ref(false);
const user = ref<UserProfile | null>(null);

const saveProfile = async () => {
  if (!user.value) return;
  saving.value = true;
  try {
    await updateUserProfile(user.value.id, user.value);
    toast.success("Profile updated successfully");
  } catch (error) {
    console.error("Failed to update profile", error);
    toast.error("Failed to update profile");
  } finally {
    saving.value = false;
  }
};

onMounted(async () => {
  try {
    const userId = fetchCurrentUserId();
    if (!userId) return;
    user.value = await fetchUserProfile(userId);
  } catch (error) {
    console.error("Failed to load user profile", error);
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <PersonalPageShell>
    <PersonalPageHeader
      title="Account Settings"
      description="Manage your personal information, security, and notification preferences."
    />

    <div
      v-if="loading"
      class="flex flex-col items-center justify-center py-20 gap-4"
    >
      <Loader2 class="h-10 w-10 animate-spin text-primary" />
      <p class="text-sm text-muted-foreground">Loading your settings...</p>
    </div>

    <div v-else-if="!user" class="text-center py-20">
      <p class="text-muted-foreground">Please log in to manage your account.</p>
    </div>

    <div v-else class="flex flex-col lg:flex-row gap-8">
      <!-- Tabs Navigation -->
      <Tabs
        defaultValue="general"
        class="w-full flex flex-col lg:flex-row gap-8"
      >
        <aside class="lg:w-1/4">
          <TabsList
            class="flex flex-row lg:flex-col h-auto bg-transparent gap-1 p-0 justify-start overflow-x-auto lg:overflow-x-visible"
          >
            <TabsTrigger
              value="general"
              class="flex items-center gap-3 px-4 py-3 justify-start w-full data-[state=active]:bg-muted/60 data-[state=active]:shadow-none rounded-xl transition-all"
            >
              <User class="h-4 w-4" />
              <span>General</span>
            </TabsTrigger>
            <TabsTrigger
              value="password"
              class="flex items-center gap-3 px-4 py-3 justify-start w-full data-[state=active]:bg-muted/60 data-[state=active]:shadow-none rounded-xl transition-all"
            >
              <Lock class="h-4 w-4" />
              <span>Security</span>
            </TabsTrigger>
            <TabsTrigger
              value="notifications"
              class="flex items-center gap-3 px-4 py-3 justify-start w-full data-[state=active]:bg-muted/60 data-[state=active]:shadow-none rounded-xl transition-all"
            >
              <Bell class="h-4 w-4" />
              <span>Notifications</span>
            </TabsTrigger>
          </TabsList>
        </aside>

        <!-- General Settings -->
        <div class="flex-1">
          <TabsContent
            value="general"
            class="mt-0 space-y-6 animate-in fade-in slide-in-from-right-4 duration-300"
          >
            <!-- Profile Section -->
            <Card class="border-none shadow-none bg-muted/20 rounded-2xl">
              <CardHeader>
                <CardTitle class="text-xl font-semibold tracking-tight">Public Profile</CardTitle>
                <CardDescription>
                  This information will be displayed publicly on your profile
                  page.
                </CardDescription>
              </CardHeader>
              <CardContent class="space-y-6">
                <div class="grid gap-6 md:grid-cols-2">
                  <div class="space-y-2">
                    <Label
                      htmlFor="username"
                      class="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                      >Username</Label
                    >
                    <div class="relative">
                      <Input
                        id="username"
                        v-model="user.username"
                        disabled
                        class="bg-muted/50 font-medium"
                      />
                      <Lock
                        class="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground"
                      />
                    </div>
                    <p class="text-[0.7rem] text-muted-foreground italic">
                      Usernames are unique and cannot be changed.
                    </p>
                  </div>
                  <div class="space-y-2">
                    <Label
                      htmlFor="name"
                      class="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                      >Display Name</Label
                    >
                    <Input
                      id="name"
                      v-model="user.name"
                      placeholder="John Doe"
                    />
                    <p class="text-[0.7rem] text-muted-foreground">
                      Your full name or a nickname.
                    </p>
                  </div>
                </div>

                <div class="space-y-2">
                  <Label
                    htmlFor="bio"
                    class="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                    >Bio</Label
                  >
                  <Textarea
                    id="bio"
                    v-model="user.bio"
                    placeholder="Tell us a bit about yourself..."
                    class="min-h-[120px] resize-none"
                  />
                  <p class="text-[0.7rem] text-muted-foreground">
                    Brief description for your profile. Max 250 characters.
                  </p>
                </div>

                <div class="grid gap-6 md:grid-cols-2">
                  <div class="space-y-2">
                    <Label
                      htmlFor="email"
                      class="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                      >Email Address</Label
                    >
                    <div class="relative">
                      <Input
                        id="email"
                        v-model="user.email"
                        disabled
                        class="bg-muted/50"
                      />
                      <Mail
                        class="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground"
                      />
                    </div>
                  </div>
                  <div class="space-y-2">
                    <Label
                      htmlFor="location"
                      class="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                      >Location</Label
                    >
                    <div class="relative">
                      <Input
                        id="location"
                        v-model="user.location"
                        placeholder="San Francisco, CA"
                      />
                      <MapPin
                        class="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <!-- Social/Links Section -->
            <Card class="border-none shadow-none bg-muted/20 rounded-2xl">
              <CardHeader>
                <CardTitle class="text-xl font-semibold tracking-tight">Web Presence</CardTitle>
                <CardDescription>
                  Add links to your professional profiles and personal website.
                </CardDescription>
              </CardHeader>
              <CardContent class="space-y-4">
                <div class="space-y-4">
                  <div class="flex items-center gap-3">
                    <div
                      class="flex h-9 w-9 items-center justify-center rounded-lg bg-background border"
                    >
                      <Globe class="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div class="flex-1">
                      <Input
                        v-model="user.website"
                        placeholder="Website URL (https://...)"
                        class="h-9"
                      />
                    </div>
                  </div>
                  <div class="flex items-center gap-3">
                    <div
                      class="flex h-9 w-9 items-center justify-center rounded-lg bg-background border"
                    >
                      <Twitter class="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div class="flex-1">
                      <Input
                        v-model="user.twitter"
                        placeholder="Twitter URL"
                        class="h-9"
                      />
                    </div>
                  </div>
                  <div class="flex items-center gap-3">
                    <div
                      class="flex h-9 w-9 items-center justify-center rounded-lg bg-background border"
                    >
                      <Github class="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div class="flex-1">
                      <Input
                        v-model="user.github"
                        placeholder="GitHub Profile URL"
                        class="h-9"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter class="bg-muted/10 border-t justify-end py-4">
                <Button
                  @click="saveProfile"
                  :disabled="saving"
                  class="rounded-full px-8"
                >
                  <Loader2 v-if="saving" class="mr-2 h-4 w-4 animate-spin" />
                  Save All Changes
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <!-- Password Settings -->
          <TabsContent
            value="password"
            class="mt-0 space-y-6 animate-in fade-in slide-in-from-right-4 duration-300"
          >
            <Card class="border-none shadow-none bg-muted/20 rounded-2xl">
              <CardHeader>
                <CardTitle class="text-lg">Change Password</CardTitle>
                <CardDescription>
                  Ensure your account is using a long, random password to stay
                  secure.
                </CardDescription>
              </CardHeader>
              <CardContent class="space-y-4">
                <div class="space-y-2">
                  <Label htmlFor="current" class="text-xs font-bold"
                    >Current Password</Label
                  >
                  <Input id="current" type="password" />
                </div>
                <div class="space-y-2">
                  <Label htmlFor="new" class="text-xs font-bold"
                    >New Password</Label
                  >
                  <Input id="new" type="password" />
                </div>
                <div class="space-y-2">
                  <Label htmlFor="confirm" class="text-xs font-bold"
                    >Confirm New Password</Label
                  >
                  <Input id="confirm" type="password" />
                </div>
              </CardContent>
              <CardFooter class="bg-muted/10 border-t justify-end py-4">
                <Button class="rounded-full px-8">Update Password</Button>
              </CardFooter>
            </Card>

            <Card class="border-destructive/20 bg-destructive/5 rounded-2xl">
              <CardHeader>
                <CardTitle class="text-lg text-destructive"
                  >Danger Zone</CardTitle
                >
                <CardDescription>
                  Permanently delete your account and all of your content.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p class="text-sm text-muted-foreground mb-4">
                  Once you delete your account, there is no going back. Please
                  be certain.
                </p>
                <Button variant="destructive" class="rounded-full"
                  >Delete Account</Button
                >
              </CardContent>
            </Card>
          </TabsContent>

          <!-- Notification Settings -->
          <TabsContent
            value="notifications"
            class="mt-0 space-y-6 animate-in fade-in slide-in-from-right-4 duration-300"
          >
            <Card class="border-none shadow-none bg-muted/20 rounded-2xl">
              <CardHeader>
                <CardTitle class="text-lg">Notification Preferences</CardTitle>
                <CardDescription>
                  Choose how you want to be notified about activity.
                </CardDescription>
              </CardHeader>
              <CardContent class="space-y-4">
                <div class="space-y-4">
                  <div
                    class="flex items-center justify-between space-x-4 rounded-xl border bg-card p-4 transition-all hover:border-primary/50"
                  >
                    <div class="flex gap-4 items-center">
                      <div
                        class="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center"
                      >
                        <Mail class="h-5 w-5 text-primary" />
                      </div>
                      <div class="space-y-0.5">
                        <Label class="text-base font-bold">Communication</Label>
                        <p class="text-sm text-muted-foreground">
                          Receive emails about your account activity and
                          updates.
                        </p>
                      </div>
                    </div>
                    <Switch :checked="true" />
                  </div>

                  <div
                    class="flex items-center justify-between space-x-4 rounded-xl border bg-card p-4 transition-all hover:border-primary/50"
                  >
                    <div class="flex gap-4 items-center">
                      <div
                        class="h-10 w-10 rounded-full bg-orange-500/10 flex items-center justify-center"
                      >
                        <Bell class="h-5 w-5 text-orange-500" />
                      </div>
                      <div class="space-y-0.5">
                        <Label class="text-base font-bold">Marketing</Label>
                        <p class="text-sm text-muted-foreground">
                          Receive emails about new products, features, and
                          offers.
                        </p>
                      </div>
                    </div>
                    <Switch :checked="false" />
                  </div>

                  <div
                    class="flex items-center justify-between space-x-4 rounded-xl border bg-card p-4 opacity-70"
                  >
                    <div class="flex gap-4 items-center">
                      <div
                        class="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center"
                      >
                        <ShieldCheck class="h-5 w-5 text-emerald-500" />
                      </div>
                      <div class="space-y-0.5">
                        <Label class="text-base font-bold"
                          >Security Alerts</Label
                        >
                        <p class="text-sm text-muted-foreground">
                          Critical security notifications (cannot be disabled).
                        </p>
                      </div>
                    </div>
                    <Switch :checked="true" disabled />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  </PersonalPageShell>
</template>
