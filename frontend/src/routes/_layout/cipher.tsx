import { createFileRoute } from "@tanstack/react-router"
import Cipher from "@/components/Cipher"

export const Route = createFileRoute("/_layout/cipher")({
  component: Cipher,
  head: () => ({
    meta: [{ title: "Cipher — Crypto Intelligence Oracle" }],
  }),
})
