import React from "react";
import { notFound } from "next/navigation";
import { api } from "../../../lib/api";
import { DiscussionDetailClient } from "./DiscussionDetailClient";

export const dynamic = "force-dynamic";

export default async function DiscussionDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const post = await api.getPost(params.id);
  if (!post) notFound();

  return <DiscussionDetailClient initialPost={post} />;
}
