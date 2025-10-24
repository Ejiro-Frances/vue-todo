<template>
  <div class="md:p-8 space-y-3 mb-1 text-sm">
    <!-- Title -->
    <div>
      <label class="font-semibold">Title</label>
      <input
        type="text"
        v-model="localForm.name"
        class="w-full border p-2 mt-2 rounded-md"
        placeholder="Task name"
      />
    </div>

    <!-- Description -->
    <div>
      <label class="font-semibold">Description</label>
      <textarea
        v-model="localForm.description"
        class="w-full border p-2 mt-2 rounded-md min-h-32"
        placeholder="Description"
      ></textarea>
    </div>

    <!-- Priority / Tag / Status -->
    <div class="grid grid-cols-2 gap-2 mb-2">
      <div>
        <label class="text-sm block mb-1">Priority</label>
        <select v-model="localForm.priority" class="w-full border p-2">
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
        </select>
      </div>

      <div>
        <label class="text-sm block mb-1">Tag</label>
        <input
          type="text"
          v-model="localForm.tags"
          class="w-full border p-2"
          placeholder="Tags"
        />
      </div>

      <div>
        <label class="text-sm block mb-1">Status</label>
        <select v-model="localForm.status" class="w-full border p-2">
          <option value="TODO">Todo</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="DONE">Done</option>
        </select>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="flex justify-end gap-2">
      <Button variant="outline" @click="onCancel">Cancel</Button>
      <Button @click="onSaveClick">Save</Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import Button from "../ui/button/Button.vue";
import type { EditableTaskFields } from "@/types";

// Props
const props = defineProps<{
  editForm: EditableTaskFields;
  onChange: (field: keyof EditableTaskFields, value: string) => void;
  onSave: () => void;
  onCancel: () => void;
}>();

// Local form copy for two-way binding
const localForm = ref({ ...props.editForm });

// Watch for changes and notify parent
watch(
  () => localForm.value,
  (newForm) => {
    for (const key in newForm) {
      props.onChange(key as keyof EditableTaskFields, newForm[key]);
    }
  },
  { deep: true }
);

// Handle save
const onSaveClick = () => {
  props.onSave();
};
</script>
