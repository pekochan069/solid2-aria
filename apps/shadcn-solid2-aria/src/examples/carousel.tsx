import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "../registry/ui/carousel";

export default function Example() {
  return (
    <Carousel class="mx-12 w-full max-w-60">
      <CarouselContent>
        <CarouselItem>
          <div class="flex h-36 items-center justify-center rounded-lg border text-3xl font-semibold">
            1
          </div>
        </CarouselItem>
        <CarouselItem>
          <div class="flex h-36 items-center justify-center rounded-lg border text-3xl font-semibold">
            2
          </div>
        </CarouselItem>
        <CarouselItem>
          <div class="flex h-36 items-center justify-center rounded-lg border text-3xl font-semibold">
            3
          </div>
        </CarouselItem>
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  );
}
