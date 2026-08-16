import { Heading } from "@astryxdesign/core/Heading";
import { Text } from "@astryxdesign/core/Text";
import { Head } from "@inertiajs/react";
import { Layout } from "../../../components/Layout";
import { PostForm } from "../../../components/PostForm";
import type { PageProps } from "../../../pages.gen";
import { astryxOverrides } from "../../../styles/astryx-overrides.stylex";
import { postStatusClassName } from "../../../styles/tailwind-classes";

type Props = PageProps<"Admin/Posts/Edit">;

export default function Edit({ post, errors, flash }: Props) {
  return (
    <Layout flash={flash}>
      <Head title={`Edit ${post.title}`} />
      <section className="mx-auto max-w-reading">
        <header className="mb-12">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Heading level={1} type="display-3" xstyle={astryxOverrides.pageHeading}>Edit post</Heading>
            <span className={postStatusClassName[post.status]}>{post.status}</span>
          </div>
          <Text type="large" color="secondary" as="p" xstyle={astryxOverrides.formLead}>Changes keep the original publication date unless the status changes.</Text>
        </header>
        <PostForm action="edit" initial={post} errors={errors} />
      </section>
    </Layout>
  );
}
