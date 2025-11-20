import React from "react";
import Wrapper from "../global/wrapper";
import Container from "../global/container";
import { Button } from "../ui/button";
import MarketCard from "./MarketCard";
import Link from "next/link";

interface PopularMarketsProps {
  markets: any[];
}

const PopularMarkets = ({ markets }: PopularMarketsProps) => {
  // Filter out featured markets if needed, or just show top markets
  // For now, let's just show the first 6 markets
  const displayMarkets = markets.slice(0, 6);

  return (
    <div className="flex flex-col items-center justify-center w-full py-16 lg:py-24 relative overflow-hidden">
      {/* Subtle background elements */}
      <div className="absolute top-1/4 -left-1/4 w-96 h-96 rounded-full blur-[6rem] bg-gradient-radial from-primary/10 via-primary/5 to-transparent -z-10" />
      <div className="absolute bottom-1/4 -right-1/4 w-96 h-96 rounded-full blur-[8rem] bg-gradient-radial from-primary/8 via-primary/3 to-transparent -z-10" />

      <Wrapper>
        <Container>
          <div className="flex flex-col lg:flex-row items-start justify-start lg:items-end lg:justify-between px-2 md:px-0">
            <div className="relative">
              <h2 className="text-3xl lg:text-4xl font-semibold text-left lg:text-start tracking-tight">
                Popular Markets
                <br />
                <span className="bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent">
                  Trade with confidence
                </span>
              </h2>
              <div className="absolute -bottom-2 left-0 w-16 h-1 bg-gradient-to-r from-primary to-primary/50 rounded-full" />
            </div>
            <p className="text-base lg:text-lg font-normal text-muted-foreground text-left lg:text-start mt-4 lg:mt-0 max-w-md">
              Join thousands of traders making predictions on the most exciting
              crypto markets
            </p>
          </div>
        </Container>

        <Container delay={0.1}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 mt-10">
            {displayMarkets.map((market, index) => (
              <Container key={market.id || index} delay={0.1 + index * 0.05}>
                <MarketCard market={market} />
              </Container>
            ))}
          </div>
        </Container>

        <Container delay={0.3}>
          <div className="flex flex-col items-center justify-center mt-12">
            <div className="flex items-center gap-4">
              <Link href="/markets">
                <Button
                    size="lg"
                    variant="outline"
                    className="border-border/60 hover:border-primary"
                >
                    View All Markets
                </Button>
              </Link>
              <Link href="/admin">
                <Button size="lg" className="bg-primary hover:bg-primary/90">
                    Create Market
                </Button>
              </Link>
            </div>
            <p className="text-sm text-muted-foreground mt-4 text-center max-w-md">
              Discover more prediction markets or create your own for the
              community to trade
            </p>
          </div>
        </Container>
      </Wrapper>
    </div>
  );
};

export default PopularMarkets;
