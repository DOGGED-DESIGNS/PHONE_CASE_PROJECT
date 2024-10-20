"use client";
import React, { useEffect, useState } from "react";
import Confetti from "react-dom-confetti";
import { Configuration } from "@prisma/client";
import Phone from "@/components/phone/Phone";
import { COLORS, MODELS } from "@/validator/OptionValidator";
import { cn, formatPrice } from "@/lib/utils";
import { ArrowRight, Check } from "lucide-react";
import { BASE_PRICE, PRODUCT_PRICES } from "@/config/Products";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { createCheckoutSession } from "./action";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
// import { title } from "process";
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import LoginModal from "@/components/LoginModal";

const DesignPreview = ({ configuration }: { configuration: Configuration }) => {
  const router = useRouter();
  const { user } = useKindeBrowserClient();
  const [showConfitti, setShowConfetti] = useState(false);
  //  this is the route side
  // this is the toast section
  const { toast } = useToast();
  const { color, model, finish, material } = configuration;
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);

  useEffect(() => {
    setShowConfetti(true);
    console.log(user);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { id } = configuration;
  const tw = COLORS.find(
    (supportedColor) => supportedColor.value === color
  )?.tw;

  const { label: modelLabel } = MODELS.options.find(
    ({ value }) => value === model
  )!;

  let totalPrice = BASE_PRICE;
  if (material === "polycarbonate")
    totalPrice += PRODUCT_PRICES.material.polycarbonate;
  if (finish === "textured") totalPrice += PRODUCT_PRICES.finish.textured;

  const { mutate: createPaymentSession, isPending } = useMutation({
    mutationKey: ["get-checkout-session"],
    mutationFn: createCheckoutSession,
    onSuccess: ({ url }) => {
      if (url) router.push(url);
      else throw new Error("unable to retrieve payment url");
    },
    onError: (error) => {
      toast({
        title: "something went wrong",
        variant: "destructive",
      });
    },
  });

  //  get user session from server and dont stop untilyou get it

  const handleCheckout = () => {
    if (user) {
      //create payment
      createPaymentSession({ configId: id });
    } else {
      //need to log in
      localStorage.setItem("configurationId", id);
      setIsLoginModalOpen(true);
    }
  };

  return (
    <>
      <div
        aria-hidden="true"
        className="  
               pointer-events-none select-none absolute inset-0 overflow-hidden flex justify-center"
      >
        <Confetti
          active={showConfitti}
          config={{
            elementCount: 900,
            startVelocity: 40,
            spread: 2000,
          }}
        />
      </div>

      <LoginModal isOpen={isLoginModalOpen} setIsOpen={setIsLoginModalOpen} />
      <div className="mt-20 flex flex-col items-center md:grid text-sm sm:grid-cols-12 sm:grid-rows-1 sm:gap-x-6 md:gap-x-8 lg:gap-x-12">
        <div className="lg:col-span-3 md:col-span-4 md:row-span-2 md:row-end-2">
          <Phone
            className={cn(`bg-${tw}`, "max-w-[150px] md:max-w-full")}
            imgSrc={configuration.imageUrl}
          />
        </div>
        <div className=" mt-6 sm:col-span-9  md:row-end-1  ">
          <h3 className=" text-3xl font-bold tracking-tight text-gray-900">
            your {modelLabel} Case{" "}
          </h3>
          <div className="mt-3 flex items-center gap-1.5 text-base ">
            <Check className=" h-4 w-4 text-green-t00" />
            In stock and ready to ship
          </div>
        </div>
        <div className="sm:col-span-12 md:col-span-9 text-base">
          <div className=" grid grid-cols-1 gap-y-8 border-b border-gray-200 py-8 sm:grid-cols-2 sm:gap-x-6 sm:py-6 md:py-10">
            <div>
              <p className=" font-medium text-zinc-950">Highlights</p>

              <ol className=" text-zinc-700 list-disc list-inside">
                <li>Wireless charging compatible</li>
                <li>TPU shock absorption</li>
                <li>Packaging made from recycled materials</li>
                <li>5 year print warranty</li>
              </ol>
            </div>
            <div>
              <p className=" font-medium text-zinc-950">Materials</p>
              <ol className=" mt-3 text-xinc-700 list-disc list-inside">
                <li>High-quality durable material</li>
                <li>scratch and fingerprint resistant coating</li>
              </ol>
            </div>
          </div>

          <div className=" mt-8">
            <div className=" bg-gray-50 p-6 sm:rounded-lg sm:p-8">
              <div className="  flow-root text-sm  ">
                <div className=" flex item-s-center justify-between py-1 mt-2 ">
                  <p className=" text-gray-600">Base Price</p>
                  <p className=" font-medium text-gray-900">
                    {formatPrice(BASE_PRICE / 100)}
                  </p>
                </div>
                {finish === "textured" ? (
                  <div className=" flex item-s-center justify-between py-1 mt-2 ">
                    <p className=" text-gray-600">Textured finish</p>
                    <p className=" font-medium text-gray-900">
                      {formatPrice(PRODUCT_PRICES.finish.textured / 100)}
                    </p>
                  </div>
                ) : null}
                {material === "polycarbonate" ? (
                  <div className=" flex item-s-center justify-between py-1 mt-2 ">
                    <p className=" text-gray-600">
                      Soft Polycarbonate Material
                    </p>
                    <p className=" font-medium text-gray-900">
                      {formatPrice(PRODUCT_PRICES.material.polycarbonate / 100)}
                    </p>
                  </div>
                ) : null}

                <div className=" my-2 h-px bg-gray-200 ">
                  <div className="flex item-center justify-betwen py-2">
                    <p className=" font-semibold text-gray-900">
                      {" "}
                      Order total{" "}
                    </p>
                    <p className=" font-semibold text-gray-900">
                      {formatPrice(totalPrice / 100)}
                    </p>
                  </div>
                </div>
              </div>
              <div>
                <div className="mt-8 flex justify-end pb-12">
                  <Button
                    onClick={() => handleCheckout()}
                    isLoading={isPending}
                    disabled={isPending}
                    loadingText="loading"
                    className="px-4 sm:px-6 lg:px-8"
                  >
                    Check Out{" "}
                    <ArrowRight className="h-4 w-4 ml-1 inline-block " />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DesignPreview;
