<script setup lang="ts">
import type { DateRange } from 'reka-ui'
import { CalendarDate, DateFormatter, getLocalTimeZone } from '@internationalized/date'
import { computed, ref, watch } from 'vue'
import { Calendar as CalendarIcon } from 'lucide-vue-next'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { RangeCalendar } from '@/components/ui/range-calendar'

const props = defineProps<{
  modelValue?: DateRange | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: DateRange | null): void
}>()

const dateFormatter = new DateFormatter('zh-CN', {
  dateStyle: 'medium',
})

const timeZone = getLocalTimeZone()

function toCalendarDate(date: Date) {
  return new CalendarDate(date.getFullYear(), date.getMonth() + 1, date.getDate())
}

function createDefaultRange(): DateRange {
  const endDate = new Date()
  const startDate = new Date(endDate)
  startDate.setDate(endDate.getDate() - 29)
  return {
    start: toCalendarDate(startDate),
    end: toCalendarDate(endDate),
  }
}

const value = ref<DateRange>(props.modelValue ?? createDefaultRange())

watch(
  () => props.modelValue,
  (newValue) => {
    if (!newValue) {
      const fallback = createDefaultRange()
      if (
        fallback.start.toString() !== value.value.start.toString() ||
        fallback.end.toString() !== value.value.end.toString()
      ) {
        value.value = fallback
      }
      emit('update:modelValue', value.value)
      return
    }
    if (
      newValue.start.toString() !== value.value.start.toString() ||
      newValue.end?.toString() !== value.value.end?.toString()
    ) {
      value.value = {
        start: newValue.start,
        end: newValue.end,
      }
    }
  },
  { immediate: true }
)

watch(
  value,
  (newValue) => {
    if (
      !props.modelValue ||
      props.modelValue.start.toString() !== newValue.start.toString() ||
      props.modelValue.end?.toString() !== newValue.end?.toString()
    ) {
      emit('update:modelValue', newValue)
    }
  },
  { deep: true }
)

const buttonLabel = computed(() => {
  if (!value.value?.start) {
    return '选择时间范围'
  }
  const startDate = value.value.start.toDate(timeZone)
  const endDate =
    value.value.end?.toDate(timeZone) ?? value.value.start.toDate(timeZone)
  return `${dateFormatter.format(startDate)} - ${dateFormatter.format(endDate)}`
})
</script>

<template>
  <div :class="cn('grid gap-2', $attrs.class ?? '')">
    <Popover>
      <PopoverTrigger as-child>
        <Button
          id="date"
          :variant="'outline'"
          :class="
            cn('w-[300px] justify-start text-left font-normal', !value && 'text-muted-foreground')
          "
        >
          <CalendarIcon class="mr-2 h-4 w-4" />
          {{ buttonLabel }}
        </Button>
      </PopoverTrigger>
      <PopoverContent class="w-auto p-0" align="end">
        <RangeCalendar
          v-model="value"
          weekday-format="short"
          :number-of-months="2"
          initial-focus
          :placeholder="value.start"
          @update:start-value="
            (startDate) => {
              value = {
                start: startDate,
                end: value.end,
              }
            }
          "
          @update:end-value="
            (endDate) => {
              value = {
                start: value.start,
                end: endDate ?? value.start,
              }
            }
          "
        />
      </PopoverContent>
    </Popover>
  </div>
</template>
