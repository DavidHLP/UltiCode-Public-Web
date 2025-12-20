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
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { toast } from "vue-sonner";
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
  <div class="space-y-6">
    <div v-if="loading" class="text-muted-foreground">Loading account...</div>
    <div v-else-if="!user" class="text-muted-foreground">
      Please log in to manage your account.
    </div>
    <div v-else class="space-y-6">
      <div class="space-y-0.5">
        <h2 class="text-2xl font-bold tracking-tight">Account Settings</h2>
        <p class="text-muted-foreground">
          Manage your account settings and set e-mail preferences.
        </p>
      </div>
      <Separator class="my-6" />
      <Tabs defaultValue="general" class="space-y-4">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="password">Password</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <!-- General Settings -->
        <TabsContent value="general" class="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>
                This is how others will see you on the site.
              </CardDescription>
            </CardHeader>
            <CardContent class="space-y-4">
              <div class="space-y-1">
                <Label htmlFor="username">Username</Label>
                <Input id="username" v-model="user.username" disabled />
                <p class="text-[0.8rem] text-muted-foreground">
                  Username cannot be changed.
                </p>
              </div>
              <div class="space-y-1">
                <Label htmlFor="name">Display Name</Label>
                <Input id="name" v-model="user.name" />
                <p class="text-[0.8rem] text-muted-foreground">
                  This is your public display name. It can be your real name or
                  a pseudonym.
                </p>
              </div>
              <div class="space-y-1">
                <Label htmlFor="email">Email</Label>
                <Input id="email" v-model="user.email" disabled />
                <p class="text-[0.8rem] text-muted-foreground">
                  Email cannot be changed currently.
                </p>
              </div>
              <div class="space-y-1">
                <Label htmlFor="bio">Bio</Label>
                <textarea
                  class="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  id="bio"
                  v-model="user.bio"
                ></textarea>
                <p class="text-[0.8rem] text-muted-foreground">
                  You can @mention other users and organizations to link to
                  them.
                </p>
              </div>
              <div class="space-y-1">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  v-model="user.location"
                  placeholder="San Francisco, CA"
                />
              </div>
              <div class="space-y-1">
                <Label>URLs</Label>
                <div class="space-y-2">
                  <Input
                    v-model="user.website"
                    placeholder="Website (https://example.com)"
                  />
                  <Input
                    v-model="user.twitter"
                    placeholder="Twitter Profile URL"
                  />
                  <Input
                    v-model="user.github"
                    placeholder="GitHub Profile URL"
                  />
                </div>
                <p class="text-[0.8rem] text-muted-foreground">
                  Add links to your website, blog, or social media profiles.
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button @click="saveProfile" :disabled="saving">
                <span v-if="saving">Saving...</span>
                <span v-else>Save Changes</span>
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <!-- Password Settings -->
        <TabsContent value="password" class="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Password</CardTitle>
              <CardDescription>
                Change your password here. After saving, you'll be logged out.
              </CardDescription>
            </CardHeader>
            <CardContent class="space-y-4">
              <div class="space-y-1">
                <Label htmlFor="current">Current Password</Label>
                <Input id="current" type="password" />
              </div>
              <div class="space-y-1">
                <Label htmlFor="new">New Password</Label>
                <Input id="new" type="password" />
              </div>
              <div class="space-y-1">
                <Label htmlFor="confirm">Confirm Password</Label>
                <Input id="confirm" type="password" />
              </div>
            </CardContent>
            <CardFooter>
              <Button>Update Password</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <!-- Notification Settings -->
        <TabsContent value="notifications" class="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>
                Configure how you receive notifications.
              </CardDescription>
            </CardHeader>
            <CardContent class="space-y-4">
              <div
                class="flex items-center justify-between space-x-2 rounded-lg border p-4"
              >
                <div class="space-y-0.5">
                  <Label class="text-base">Communication emails</Label>
                  <p class="text-sm text-muted-foreground">
                    Receive emails about your account activity.
                  </p>
                </div>
                <Switch :checked="true" />
              </div>
              <div
                class="flex items-center justify-between space-x-2 rounded-lg border p-4"
              >
                <div class="space-y-0.5">
                  <Label class="text-base">Marketing emails</Label>
                  <p class="text-sm text-muted-foreground">
                    Receive emails about new products, features, and more.
                  </p>
                </div>
                <Switch :checked="false" />
              </div>
              <div
                class="flex items-center justify-between space-x-2 rounded-lg border p-4"
              >
                <div class="space-y-0.5">
                  <Label class="text-base">Security emails</Label>
                  <p class="text-sm text-muted-foreground">
                    Receive emails about your account security.
                  </p>
                </div>
                <Switch :checked="true" disabled />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  </div>
</template>
