import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface HeaderModel {
  id: number
  index: number
  title: string
  icon: string
  color?: string
  iconColor?: string
}

export interface HeaderGroup {
  id: string
  name: string
  headers: HeaderModel[]
}

export interface LayoutNode {
  id: string
  type: 'container' | 'leaf'
  direction?: 'horizontal' | 'vertical'
  size?: number
  children?: LayoutNode[]
  groupId?: string
  groupMetadata?: {
    id: string
    name: string
  }
}

export const useHeaderStore = defineStore('header', () => {
  const layoutConfig = ref<LayoutNode | null>(null)
  const activeGroupId = ref<string | null>(null)
  const headerGroups = ref<HeaderGroup[]>([])

  const visibleGroups = computed(() => headerGroups.value.filter((g) => g.headers.length > 0))

  const initData = (groups: HeaderGroup[], layout: LayoutNode) => {
    headerGroups.value = groups
    layoutConfig.value = layout
    // 默认选中第一个有内容的组
    const firstVisible = groups.find((g) => g.headers.length > 0)
    if (firstVisible) {
      activeGroupId.value = firstVisible.id
    }
  }

  const updateGroupHeaders = (groupId: string, newHeaders: HeaderModel[]) => {
    const group = headerGroups.value.find((g) => g.id === groupId)
    if (group) {
      group.headers = newHeaders.map((header, idx) => ({
        ...header,
        index: idx,
      }))
    }
  }

  const moveHeaderBetweenGroups = (
    sourceGroupId: string,
    targetGroupId: string,
    sourceIndex: number,
    targetIndex: number,
  ) => {
    const sourceGroup = headerGroups.value.find((g) => g.id === sourceGroupId)
    const targetGroup = headerGroups.value.find((g) => g.id === targetGroupId)

    if (!sourceGroup || !targetGroup) return

    const [movedItem] = sourceGroup.headers.splice(sourceIndex, 1)
    if (movedItem) {
      targetGroup.headers.splice(targetIndex, 0, movedItem)

      sourceGroup.headers = sourceGroup.headers.map((header, idx) => ({
        ...header,
        index: idx,
      }))

      targetGroup.headers = targetGroup.headers.map((header, idx) => ({
        ...header,
        index: idx,
      }))
    }
  }

  const setActiveGroup = (groupId: string) => {
    activeGroupId.value = groupId
  }

  const updateLayout = (layout: LayoutNode) => {
    layoutConfig.value = layout
  }

  const splitGroup = (
    sourceGroupId: string,
    targetGroupId: string,
    sourceIndex: number,
    direction: 'top' | 'bottom' | 'left' | 'right' | 'center',
  ) => {
    const sourceGroup = headerGroups.value.find((g) => g.id === sourceGroupId)
    const targetGroup = headerGroups.value.find((g) => g.id === targetGroupId)

    if (!sourceGroup || !targetGroup) return

    // Remove from source
    const [movedItem] = sourceGroup.headers.splice(sourceIndex, 1)
    if (!movedItem) return

    // Re-index source group
    sourceGroup.headers.forEach((h, i) => (h.index = i))

    if (direction === 'center') {
      // Move to target group (append)
      targetGroup.headers.push(movedItem)
      targetGroup.headers.forEach((h, i) => (h.index = i))
      return
    }

    // Create new group for the split
    const newGroupId = `group-${Date.now()}`
    const newGroup: HeaderGroup = {
      id: newGroupId,
      name: 'New Group', // Could be dynamic based on header title
      headers: [movedItem],
    }
    newGroup.headers.forEach((h, i) => (h.index = i))
    headerGroups.value.push(newGroup)

    // Helper to modify layout tree
    const modifyLayout = (node: LayoutNode): boolean => {
      if (node.type === 'leaf' && node.groupId === targetGroupId) {
        // Convert leaf to container
        const originalGroupId = node.groupId
        const originalGroupMetadata = node.groupMetadata

        // Reset properties of the current node to become a container
        node.type = 'container'
        node.groupId = undefined
        node.groupMetadata = undefined
        node.direction = direction === 'left' || direction === 'right' ? 'horizontal' : 'vertical'

        const newLeafNode: LayoutNode = {
          id: `leaf-${newGroupId}`,
          type: 'leaf',
          groupId: newGroupId,
          groupMetadata: {
            id: newGroupId,
            name: 'New Group',
          },
          size: 50,
        }

        const originalLeafNode: LayoutNode = {
          id: `leaf-${originalGroupId}-${Date.now()}`,
          type: 'leaf',
          groupId: originalGroupId,
          groupMetadata: originalGroupMetadata,
          size: 50,
        }

        if (direction === 'left' || direction === 'top') {
          node.children = [newLeafNode, originalLeafNode]
        } else {
          node.children = [originalLeafNode, newLeafNode]
        }
        return true
      }

      if (node.children) {
        for (const child of node.children) {
          if (modifyLayout(child)) return true
        }
      }
      return false
    }

    if (layoutConfig.value) {
      modifyLayout(layoutConfig.value)
    }

    // Ensure new group is active
    activeGroupId.value = newGroupId
  }

  return {
    headerGroups,
    visibleGroups,
    layoutConfig,
    activeGroupId,
    initData,
    updateGroupHeaders,
    moveHeaderBetweenGroups,
    setActiveGroup,
    updateLayout,
    splitGroup,
  }
})
