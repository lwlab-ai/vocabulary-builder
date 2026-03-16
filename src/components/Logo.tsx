import Image from "next/image"


export default function Logo({ variant = "md" }: { variant?: "md" | "sm" }) {
    return (
        <div className="flex items-center gap-2">
            <Image src="/capy.png" alt="Logo" width={variant === "md" ? 100 : 50} height={variant === "md" ? 100 : 50} className="rounded-full overflow-hidden" />
            <h1 className={`text-${variant === "md" ? "2xl" : "xl"} font-bold text-center text-neutral-900`}>
                Vocabulary Builder
            </h1>
        </div>
    )
}