"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { chatbotConfig } from "@/lib/config";
import type { UIMessage } from "ai";
import type { HTMLAttributes } from "react";
import { Icon } from "@iconify/react";

export type MessageProps = HTMLAttributes<HTMLDivElement> & {
  from: UIMessage["role"];
};

export const Message = ({
  className,
  from,
  children,
  ...props
}: MessageProps) => (
  <div
    className={cn(
      "group flex w-full items-end justify-end py-4",
      from === "user" ? "is-user" : "is-assistant flex-row-reverse justify-end bg-gray-950",
      "[&>div]:max-w-[80%]",
      className
    )}
    {...props}
  >
    {children}
    {from !== "user" ? (
      <Avatar aria-label={chatbotConfig.name} className="w-10 h-10 mx-2">
        <AvatarFallback className="bg-gray-950 border-2 border-gray-900">
          <Icon icon="mdi:robot" className="size-4 text-gray-100" />
        </AvatarFallback>
        <AvatarImage
          src={chatbotConfig.ui.avatarImage}
          alt={chatbotConfig.name}
          className="bg-gray-950 border-2 border-gray-900 text-gray-100"
        />
      </Avatar>
    ) : null}
  </div>
);

export type MessageContentProps = HTMLAttributes<HTMLDivElement>;

export const MessageContent = ({
  children,
  className,
  ...props
}: MessageContentProps) => (
  <div
    className={cn(
      "flex flex-col gap-2 overflow-hidden rounded-sm px-4 py-3 text-foreground text-sm",
      "group-[.is-user]:bg-gray-900 group-[.is-user]:text-gray-100",
      "group-[.is-assistant]:text-gray-100 group-[.is-assistant]:bg-gray-900",
      className
    )}
    {...props}
  >
    <div className="is-user:dark bg-transparent text-gray-100">{children}</div>
  </div>
);
