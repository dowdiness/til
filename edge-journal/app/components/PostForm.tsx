import { Button } from "@astryxdesign/core/Button";
import { Selector } from "@astryxdesign/core/Selector";
import { Stack } from "@astryxdesign/core/Stack";
import { Text } from "@astryxdesign/core/Text";
import { TextArea } from "@astryxdesign/core/TextArea";
import { TextInput } from "@astryxdesign/core/TextInput";
import { router, useForm } from "@inertiajs/react";
import { useEffect, useEffectEvent, useState, type FormEvent } from "react";
import type { PostInput } from "../../domain/post";
import { isPostStatus, validatePostInput, type FieldErrors } from "../../domain/post-validation";
import { astryxOverrides } from "../styles/astryx-overrides.stylex";

type PostFormProps = {
  action: "create" | "edit";
  initial: PostInput & { id?: number };
  errors?: FieldErrors;
};

const statusOptions = [
  { value: "draft", label: "Draft" },
  { value: "published", label: "Published" },
];

type PostField = keyof PostInput;

const allFieldsTouched = {
  title: true,
  slug: true,
  excerpt: true,
  body: true,
  status: true,
} as const satisfies Partial<Record<PostField, true>>;

function errorStatus(message?: string): { type: "error"; message: string } | undefined {
  return message ? { type: "error", message } : undefined;
}

export function PostForm({ action, initial, errors = {} }: PostFormProps) {
  const rememberKey = action === "create" ? "AdminPostCreate" : `AdminPostEdit:${initial.id ?? "unknown"}`;
  const form = useForm<PostInput>(rememberKey, {
    title: initial.title,
    slug: initial.slug,
    excerpt: initial.excerpt,
    body: initial.body,
    status: initial.status,
  });
  const [touched, setTouched] = useState<Partial<Record<PostField, true>>>({});
  const [dismissedServerErrors, setDismissedServerErrors] = useState<Partial<Record<PostField, string>>>({});
  const validation = validatePostInput(form.data);
  const clientErrors = validation.ok ? {} : validation.errors;
  const hasUnsavedChanges = useEffectEvent(() => form.isDirty);

  useEffect(() => {
    const removeBeforeListener = router.on("before", (event) => {
      const visit = event.detail.visit;
      if (!hasUnsavedChanges() || visit.method !== "get" || visit.prefetch) return;
      return window.confirm("You have unsaved changes. Leave this page?");
    });
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!hasUnsavedChanges()) return;
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      removeBeforeListener();
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  const touch = (field: PostField) => {
    setTouched((current) => ({ ...current, [field]: true }));
  };
  const changeField = (field: PostField, value: string) => {
    switch (field) {
      case "title": form.setData("title", value); break;
      case "slug": form.setData("slug", value); break;
      case "excerpt": form.setData("excerpt", value); break;
      case "body": form.setData("body", value); break;
      case "status": if (isPostStatus(value)) form.setData("status", value); break;
    }
    if (errors[field]) setDismissedServerErrors((current) => ({ ...current, [field]: errors[field] }));
  };
  const fieldError = (field: PostField): string | undefined => {
    if (errors[field] && dismissedServerErrors[field] !== errors[field]) return errors[field];
    return touched[field] ? clientErrors[field] : undefined;
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setTouched(allFieldsTouched);
    if (!validation.ok) return;
    setDismissedServerErrors({});
    if (action === "create") form.post("/admin/posts");
    else form.patch(`/admin/posts/${initial.id ?? 0}`);
  };

  return (
    <form onSubmit={submit} noValidate className="post-form">
      <Stack gap={5}>
        <TextInput
          label="Title"
          description="A clear title, up to 120 characters."
          value={form.data.title}
          onChange={(value) => changeField("title", value)}
          onBlur={() => touch("title")}
          status={errorStatus(fieldError("title"))}
          statusVariant="detached"
          htmlName="title"
          isRequired
          width="100%"
          xstyle={astryxOverrides.touchTextInput}
        />
        <TextInput
          label="Slug"
          description="Lowercase letters, numbers, and single hyphens."
          value={form.data.slug}
          onChange={(value) => changeField("slug", value)}
          onBlur={() => touch("slug")}
          status={errorStatus(fieldError("slug"))}
          statusVariant="detached"
          htmlName="slug"
          isRequired
          width="100%"
          xstyle={astryxOverrides.touchTextInput}
        />
        <TextArea
          label="Excerpt"
          description="A short summary shown in article lists."
          value={form.data.excerpt}
          onChange={(value) => changeField("excerpt", value)}
          onBlur={() => touch("excerpt")}
          status={errorStatus(fieldError("excerpt"))}
          statusVariant="detached"
          htmlName="excerpt"
          rows={4}
          maxLength={300}
          isRequired
          width="100%"
        />
        <TextArea
          label="Body"
          description="Plain text is preserved exactly as written."
          value={form.data.body}
          onChange={(value) => changeField("body", value)}
          onBlur={() => touch("body")}
          status={errorStatus(fieldError("body"))}
          statusVariant="detached"
          htmlName="body"
          rows={18}
          maxLength={50000}
          isRequired
          width="100%"
        />
        <Selector
          label="Status"
          description="Published notes become visible on the public journal."
          options={statusOptions}
          value={form.data.status}
          onChange={(value) => {
            if (isPostStatus(value)) {
              changeField("status", value);
              touch("status");
            }
          }}
          status={errorStatus(fieldError("status"))}
          statusVariant="detached"
          htmlName="status"
          isRequired
          width="100%"
        />
        {form.isDirty ? (
          <Text
            type="supporting"
            color="accent"
            as="p"
            xstyle={astryxOverrides.unsavedNotice}
            role="status"
          >
            Unsaved changes are remembered in this browser history entry.
          </Text>
        ) : null}
        <div className="form-actions">
          <Button
            type="submit"
            label={action === "create" ? "Create post" : "Save changes"}
            variant="primary"
            size="lg"
            isDisabled={form.processing}
            isLoading={form.processing}
          />
          <Button label="Cancel" href="/admin/posts" variant="ghost" size="lg" />
        </div>
      </Stack>
    </form>
  );
}
