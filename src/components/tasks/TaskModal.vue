<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(0,0,0,0.4)] dark:bg-[rgba(0,0,0,0.7)]"
    @mousedown.self="handleClose"
  >
    <div class="relative">
      <Form
        v-slot="{ errors, meta }"
        @submit="handleSubmit"
        class="bg-background w-138 max-w-[60%] md:max-w-[80%] mx-auto min-h-[50vh] rounded-2xl p-5 md:p-10 space-y-3 mb-6 text-sm shadow-2xl backdrop-blur-3xl"
      >
        <!-- 📝 Task Name -->
        <div>
          <label for="name">Task title</label>
          <Field
            id="name"
            name="name"
            type="text"
            rules="required|min:2"
            placeholder="Task name"
            class="w-full p-2 border rounded-md mt-1 bg-transparent"
          />
          <span class="text-red-600 text-xs">{{ errors.name }}</span>
        </div>

        <!-- 🧾 Description -->
        <div>
          <label for="description">Task description</label>
          <Field
            as="textarea"
            id="description"
            name="description"
            placeholder="Task description (optional)"
            rows="4"
            class="w-full p-2 border rounded-md mt-1 bg-transparent"
          />
        </div>

        <!-- 🏷 Tags and Priority -->
        <div class="grid grid-cols-2 gap-4">
          <div class="flex flex-col gap-1">
            <label for="tags">Task tag</label>
            <Field
              id="tags"
              name="tags"
              placeholder="e.g., work, personal"
              class="w-full p-2 border rounded-md mt-1 bg-transparent"
            />
          </div>

          <div class="flex flex-col gap-1">
            <label for="priority">Priority</label>
            <Field
              as="select"
              id="priority"
              name="priority"
              rules="required"
              class="w-full p-2 border rounded-md mt-1"
            >
              <option disabled value="">Select priority</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </Field>
            <span class="text-red-600 text-xs">{{ errors.priority }}</span>
          </div>
        </div>

        <!-- ❗ API Error Message -->
        <div
          v-if="errorMessage"
          class="border border-red-600 bg-red-200 p-2 text-red-900 rounded"
        >
          <p>{{ errorMessage }}</p>
        </div>

        <!-- 🔘 Buttons -->
        <div class="flex justify-between mt-5">
          <button
            type="button"
            @click="handleClose"
            class="border px-3 py-2 rounded-md"
          >
            Cancel
          </button>
          <button
            type="submit"
            :disabled="isSubmitting || !meta.valid"
            class="bg-primary text-white px-3 py-2 rounded-md"
          >
            {{ isSubmitting ? "Adding..." : "+ Add Task" }}
          </button>
        </div>
      </Form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { Form, Field, defineRule } from "vee-validate";

// ✅ Define rules manually (no yup)
defineRule("required", (value) => {
  if (!value || !String(value).trim()) return "This field is required";
  return true;
});

defineRule("min", (value, [limit]) => {
  if (!value) return true;
  if (value.length < limit) return `Minimum ${limit} characters required`;
  return true;
});

const props = defineProps({
  isOpen: Boolean,
  onCreateTask: Function,
});

const emit = defineEmits(["update:isOpen"]);

const isSubmitting = ref(false);
const errorMessage = ref("");

const handleClose = () => {
  emit("update:isOpen", false);
  errorMessage.value = "";
};

const handleSubmit = async (values, { resetForm }) => {
  isSubmitting.value = true;
  errorMessage.value = "";

  const taskData = {
    name: values.name.trim(),
    description: values.description?.trim() || null,
    tags: values.tags?.trim() || null,
    priority: values.priority,
    status: "TODO",
    archived: false,
  };

  try {
    await props.onCreateTask(taskData);
    resetForm();
    emit("update:isOpen", false);
  } catch (err) {
    let msg = "Error creating task: ";
    if (err.response?.data?.message) msg += err.response.data.message;
    else if (err.message) msg += err.message;
    else msg += "Unknown error occurred";
    errorMessage.value = msg;
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style scoped>
/* Optional styling for form focus states */
input:focus,
textarea:focus,
select:focus {
  outline: none;
  border-color: #2563eb; /* blue-600 */
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.2);
}
</style>
