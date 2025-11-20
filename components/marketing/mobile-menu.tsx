import { Sheet, SheetTrigger, SheetContent, SheetClose, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { NAV_LINKS } from "@/constants/links"
import Link from "next/link"
import { MenuIcon } from "lucide-react"
import { useWallet } from "@solana/wallet-adapter-react"
import { WalletDisconnectButton, WalletMultiButton } from "@solana/wallet-adapter-react-ui"

const MobileMenu = () => {
    const { connected } = useWallet();

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button size="icon" variant="ghost">
                    <MenuIcon className="size-5" />
                </Button>
            </SheetTrigger>
            <SheetContent side="right" className="p-4 bg-[#0a0a0f]/95 backdrop-blur-xl border-l border-border">
                <SheetHeader className="sr-only">
                    <SheetTitle>
                        Menu
                    </SheetTitle> 
                </SheetHeader>
                <div className="flex flex-col gap-6 mt-8">
                    {NAV_LINKS.map((link, index) => (
                        <SheetClose asChild key={index}>
                            <Link href={link.link} className="text-lg font-medium w-full hover:text-primary transition-colors">
                                {link.name}
                            </Link>
                        </SheetClose>
                    ))}
                    
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
