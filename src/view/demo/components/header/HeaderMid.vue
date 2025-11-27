<script setup lang="ts">
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Play } from "lucide-vue-next";
import { CloudUpload } from "lucide-vue-next";
import { StickyNote } from "lucide-vue-next";
</script>

<template>
  <ButtonGroup>
    <ButtonGroup>
      <Button variant="outline" size="icon" aria-label="Play">
        <Play />
      </Button>
      <Button variant="outline" aria-label="CloudUpload">
        <CloudUpload />
        <span>提交</span>
      </Button>
    </ButtonGroup>
    <ButtonGroup>
      <Button variant="outline" size="icon" aria-label="StickyNote">
        <StickyNote />
      </Button>
    </ButtonGroup>
  </ButtonGroup>
</template>
