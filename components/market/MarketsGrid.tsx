import React from "react";
import Wrapper from "../global/wrapper";
import Container from "../global/container";
import { Button } from "../ui/button";
import MarketCard from "../marketing/MarketCard";
import MarketCardSkeleton from "../marketing/MarketCardSkeleton";

interface MarketsGridProps {
  markets: any[];
  loading: boolean;
}

const MarketsGrid = ({ markets, loading }: MarketsGridProps) => {
  return (
    <div className="flex flex-col items-center justify-center w-full py-16 lg:py-24">
      <Wrapper>
        <Container>
          <div className="flex flex-col lg:flex-row items-start justify-between mb-12">
            <div>
              <h2 className="text-3xl lg:text-4xl font-semibold tracking-tight mb-4">
                All Markets
              </h2>
              <p className="text-base lg:text-lg text-muted-foreground max-w-2xl">
                Browse all active prediction markets and find your next trading
                opportunity
              </p>
            </div>
            <div className="flex items-center gap-4 mt-6 lg:mt-0">
              <Button
                variant="outline"
                size="sm"
                className="border-border/60 hover:border-primary/60"
              >
                Filter
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="border-border/60 hover:border-primary/60"
              >
                Sort by Volume
              </Button>
            </div>
          </div>
        </Container>

        <Container delay={0.1}>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <MarketCardSkeleton key={i} />
              ))}
            </div>
          ) : markets.length === 0 ? (
            <div className="text-center text-muted-foreground py-20">
              <p>No markets available</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {markets.map((market, index) => (
                <Container key={market.id || index} delay={0.05 + index * 0.02}>
                  <MarketCard market={market} />
                </Container>
              ))}
            </div>
          )}
        </Container>

        <Container delay={0.3}>
          <div className="text-center mt-12">
            <Button size="lg" className="bg-primary hover:bg-primary/90">
              Load More Markets
            </Button>
          </div>
        </Container>
      </Wrapper>
    </div>
  );
};

export default MarketsGrid;
