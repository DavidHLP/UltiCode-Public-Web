import { ref } from 'vue'

const activeCaseLabel = ref<string | null>(null)

export const useBottomPanelStore = () => {
  return {
    activeCaseLabel,
  }
}
