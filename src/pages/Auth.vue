<template>
  <section
    class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8"
  >
    <div
      class="max-w-md w-full space-y-8 min-h-[470px] bg-white rounded-2xl shadow-md px-8 py-4"
    >
      <!-- Toggle Buttons -->
      <div class="w-full grid grid-cols-2 bg-gray-100 p-1 rounded-md">
        <Button
          @click="switchForm(true)"
          :variant="isLogin ? 'default' : 'ghost'"
          :disabled="isLoading"
        >
          Login
        </Button>
        <Button
          @click="switchForm(false)"
          :variant="!isLogin ? 'default' : 'ghost'"
          :disabled="isLoading"
        >
          Sign up
        </Button>
      </div>

      <!-- Heading -->
      <h1 class="mt-6 text-center text-3xl font-extrabold text-gray-600">
        {{ isLogin ? "Log into your account" : "Create an account" }}
      </h1>

      <!-- Form -->
      <Form
        :validation-schema="schema"
        @submit="onSubmit"
        ref="formRef"
        v-slot="{ errors }"
      >
        <div class="space-y-4 mt-8">
          <!-- Full name (signup only) -->
          <div v-if="!isLogin" class="flex flex-col gap-1.5">
            <label for="name" class="text-sm font-medium text-gray-700">
              Full name
            </label>
            <Field
              name="name"
              id="name"
              placeholder="Full name"
              class="block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500"
              :class="{ 'border-red-500': errors.name }"
            />
            <span v-if="errors.name" class="text-red-500 text-sm">
              {{ errors.name }}
            </span>
          </div>

          <!-- Email -->
          <div class="flex flex-col gap-1.5">
            <label for="email" class="text-sm font-medium text-gray-700">
              Email
            </label>
            <Field
              name="email"
              id="email"
              type="email"
              placeholder="Email address"
              class="block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500"
              :class="{ 'border-red-500': errors.email }"
            />
            <span v-if="errors.email" class="text-red-500 text-sm">
              {{ errors.email }}
            </span>
          </div>

          <!-- Password -->
          <div class="flex flex-col gap-1.5">
            <label for="password" class="text-sm font-medium text-gray-700">
              Password
            </label>
            <Field
              name="password"
              id="password"
              type="password"
              placeholder="Password"
              class="block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500"
              :class="{ 'border-red-500': errors.password }"
            />
            <span v-if="errors.password" class="text-red-500 text-sm">
              {{ errors.password }}
            </span>
          </div>

          <!-- Confirm Password (signup only) -->
          <div v-if="!isLogin" class="flex flex-col gap-1.5">
            <label
              for="confirmPassword"
              class="text-sm font-medium text-gray-700"
            >
              Confirm Password
            </label>
            <Field
              name="confirmPassword"
              id="confirmPassword"
              type="password"
              placeholder="Confirm password"
              class="block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500"
              :class="{ 'border-red-500': errors.confirmPassword }"
            />
            <span v-if="errors.confirmPassword" class="text-red-500 text-sm">
              {{ errors.confirmPassword }}
            </span>
          </div>
        </div>

        <!-- Submit Button -->
        <Button
          type="submit"
          :disabled="isLoading"
          class="w-full mt-6 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span v-if="isLoading" class="flex items-center justify-center gap-2">
            <svg class="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
                fill="none"
              />
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            {{ isLogin ? "Logging in..." : "Signing up..." }}
          </span>
          <span v-else>
            {{ isLogin ? "Log in" : "Sign up" }}
          </span>
        </Button>
      </Form>

      <!-- Feedback messages -->
      <Transition name="fade">
        <div
          v-if="success"
          class="mt-4 p-3 bg-green-100 text-green-700 rounded-md text-sm"
        >
          {{ success }}
        </div>
      </Transition>

      <Transition name="fade">
        <div
          v-if="error"
          class="mt-4 p-3 bg-red-100 text-red-700 rounded-md text-sm"
        >
          {{ error }}
        </div>
      </Transition>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { Form, Field, defineRule, configure } from "vee-validate";
import { required, email, min, confirmed } from "@vee-validate/rules";
import Button from "@/components/ui/button/Button.vue";
import { useAuth } from "@/composables/useAuth";
import type { SignupFormData, LoginFormData } from "@/types";

// ✅ Define validation rules
defineRule("required", required);
defineRule("email", email);
defineRule("min", min);
defineRule("confirmed", confirmed);

// ✅ Configure validation messages
configure({
  generateMessage: (ctx) => {
    const messages: Record<string, string> = {
      required: `${ctx.field} is required`,
      email: "Enter a valid email address",
      min: `${ctx.field} must be at least ${ctx.rule?.params?.[0]} characters`,
      confirmed: "Passwords do not match",
    };
    return messages[ctx.rule?.name || ""] || `${ctx.field} is invalid`;
  },
});

// ✅ State
const isLogin = ref(true);
const success = ref("");
const error = ref("");
const formRef = ref<InstanceType<typeof Form> | null>(null);
const router = useRouter();

// ✅ Validation schema
const schema = computed(() => {
  return isLogin.value
    ? {
        email: "required|email",
        password: "required|min:6",
      }
    : {
        name: "required|min:3",
        email: "required|email",
        password: "required|min:6",
        confirmPassword: "required|confirmed:@password",
      };
});

// ✅ Get auth mutations
const { loginMutation, signupMutation } = useAuth();

// ✅ Combined loading state
const isLoading = computed(
  () => loginMutation.isPending.value || signupMutation.isPending.value
);

// ✅ Submit handler
const onSubmit = async (values: LoginFormData | SignupFormData) => {
  success.value = "";
  error.value = "";

  try {
    if (isLogin.value) {
      await loginMutation.mutateAsync(values as LoginFormData);
      success.value = "Logged in successfully!";

      // Redirect after a brief delay
      setTimeout(() => {
        router.push("/tasks");
      }, 500);
    } else {
      const { confirmPassword, ...payload } = values as SignupFormData;
      await signupMutation.mutateAsync(payload);
      success.value = "Account created successfully!";

      // Redirect after a brief delay
      setTimeout(() => {
        router.push("/tasks");
      }, 500);
    }
  } catch (err: any) {
    console.error("Auth error:", err);
    error.value =
      err?.response?.data?.message || err?.message || "Something went wrong!";
  }
};

// ✅ Switch form
const switchForm = (login: boolean) => {
  isLogin.value = login;
  success.value = "";
  error.value = "";

  if (formRef.value) {
    formRef.value.resetForm();
  }
};
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
