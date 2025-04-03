"use client";

import LogsDisplay from "./LogsDisplay";

interface LogsDisplayWrapperProps {
  selectedTokenId?: string;
}

export default function LogsDisplayWrapper({
  selectedTokenId,
}: LogsDisplayWrapperProps) {
  return <LogsDisplay tokenId={selectedTokenId} />;
}
