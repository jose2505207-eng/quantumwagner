import { Sheet, SheetTrigger, SheetContent, SheetClose, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { MenuIcon } from "lucide-react"
import { useWallet } from "@solana/wallet-adapter-react"
import { WalletDisconnectButton, WalletMultiButton } from "@solana/wallet-adapter-react-ui"
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { isAdminWallet } from "@/lib/admin"

const MobileMenu = () => {
    const { connected, publicKey } = useWallet();

    // Admin link visibility — navigation only, see lib/admin.ts.
    const hasAccess = isAdminWallet(publicKey?.toBase58());

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button size="icon" variant="ghost">
                    <MenuIcon className="size-5" />
                </Button>
            </SheetTrigger>
            <SheetContent side="right" className="p-4 bg-[#0a0a0f]/95 backdrop-blur-xl border-l border-border overflow-y-auto">
                <SheetHeader className="sr-only">
                    <SheetTitle>
                        Menu
                    </SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-4 mt-8">
                    <SheetClose asChild>
                        <Link href="/markets" className="text-lg font-medium w-full hover:text-primary transition-colors py-2">
                            Markets
                        </Link>
                    </SheetClose>

                    <SheetClose asChild>
                        <Link href="/how-it-works" className="text-lg font-medium w-full hover:text-primary transition-colors py-2">
                            How It Works
                        </Link>
                    </SheetClose>

                    <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="token" className="border-b-0">
                            <AccordionTrigger className="text-lg font-medium py-2 hover:no-underline hover:text-primary">Token</AccordionTrigger>
                            <AccordionContent className="flex flex-col gap-2 pl-4">
                                <SheetClose asChild>
                                    <Link href="/buytoken" className="text-base text-muted-foreground hover:text-primary transition-colors py-1">
                                        Buy Token
                                    </Link>
                                </SheetClose>
                                <SheetClose asChild>
                                    <Link href="/token" className="text-base text-muted-foreground hover:text-primary transition-colors py-1">
                                        Launchpad
                                    </Link>
                                </SheetClose>
                            </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="battle" className="border-b-0">
                            <AccordionTrigger className="text-lg font-medium py-2 hover:no-underline hover:text-primary">Battle</AccordionTrigger>
                            <AccordionContent className="flex flex-col gap-2 pl-4">
                                <SheetClose asChild>
                                    <Link href="/battlearena" className="text-base text-muted-foreground hover:text-primary transition-colors py-1">
                                        Meme Battle
                                    </Link>
                                </SheetClose>
                                <SheetClose asChild>
                                    <Link href="/fastbet" className="text-base text-muted-foreground hover:text-primary transition-colors py-1">
                                        Fast Bets
                                    </Link>
                                </SheetClose>
                                <SheetClose asChild>
                                    <Link href="/battlearena/new" className="text-base text-muted-foreground hover:text-primary transition-colors py-1">
                                        Create Battle
                                    </Link>
                                </SheetClose>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>

                    <SheetClose asChild>
                        <Link href="/leaderboard" className="text-lg font-medium w-full hover:text-primary transition-colors py-2">
                            Leaderboard
                        </Link>
                    </SheetClose>

                    <SheetClose asChild>
                        <Link href="/portfolio" className="text-lg font-medium w-full hover:text-primary transition-colors py-2">
                            Portfolio
                        </Link>
                    </SheetClose>

                    {hasAccess && (
                        <SheetClose asChild>
                            <Link href="/admin" className="text-lg font-medium w-full hover:text-primary transition-colors py-2">
                                Admin
                            </Link>
                        </SheetClose>
                    )}

                    <div className="mt-4 flex flex-col gap-4">
                        <WalletMultiButton className="w-full !bg-primary hover:!bg-primary/90" />
                        {connected && <WalletDisconnectButton className="w-full" />}
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    )
}

export default MobileMenu 
