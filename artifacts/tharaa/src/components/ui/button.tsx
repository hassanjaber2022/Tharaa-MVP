import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-bold transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary/40 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 cursor-pointer select-none active:scale-[0.97] active:translate-y-0',
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground shadow-md shadow-primary/20 hover:bg-primary/95 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/25 border border-primary/20',
        destructive:
          'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90 hover:-translate-y-0.5 border border-destructive/20',
        outline:
          'border border-border/80 bg-card/70 hover:bg-muted/70 hover:border-secondary/50 text-foreground hover:-translate-y-0.5 shadow-xs',
        secondary:
          'bg-secondary text-secondary-foreground shadow-md shadow-secondary/20 hover:bg-secondary/95 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-secondary/30 border border-secondary/30',
        ghost: 
          'border border-transparent hover:bg-muted/60 text-foreground hover:text-primary',
        link: 
          'text-primary underline-offset-4 hover:underline hover:text-primary/80',
      },
      size: {
        default: 'min-h-11 px-5 py-2.5 rounded-2xl',
        sm: 'min-h-9 rounded-xl px-3.5 text-xs',
        lg: 'min-h-13 rounded-2xl px-8 text-base',
        icon: 'h-11 w-11 rounded-2xl',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = 'Button';

export { Button, buttonVariants };
