import React from "react";
import { notFound } from "next/navigation";
import { api } from "../../../lib/api";
import { PollDetailClient } from "./PollDetailClient";

export const dynamic = "force-dynamic";

export default async function PollDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const poll = await api.getPoll(params.id);
  if (!poll) notFound();

  return <PollDetailClient initialPoll={poll} />;
}
