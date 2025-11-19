<script setup lang="ts">
import type { ContestFaqItem } from '@/mocks/schema/contest'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'

const props = defineProps<{
  faqs: ContestFaqItem[]
}>()
</script>

<template>
  <Card class="bg-card/80 backdrop-blur">
    <CardHeader>
      <CardTitle>FAQ</CardTitle>
      <CardDescription>Contest policy clarifications</CardDescription>
    </CardHeader>
    <CardContent>
      <Accordion type="single" collapsible>
        <AccordionItem v-for="faq in props.faqs" :key="faq.id" :value="faq.id">
          <AccordionTrigger class="text-left font-semibold">
            {{ faq.question }}
          </AccordionTrigger>
          <AccordionContent class="text-sm text-muted-foreground">
            {{ faq.answer }}
            <div v-if="faq.tags?.length" class="mt-3 flex flex-wrap gap-2">
              <Badge v-for="tag in faq.tags" :key="tag" variant="outline" class="text-xs">
                {{ tag }}
              </Badge>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </CardContent>
  </Card>
</template>
