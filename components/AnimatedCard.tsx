'use client';

import { motion } from 'motion/react';
import { Card } from './ui/card';
import { ComponentProps, forwardRef } from 'react';

export const AnimatedCard = forwardRef<
    HTMLDivElement,
    ComponentProps<typeof Card>
>(({ children, className, ...props }, ref) => {
    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
        >
            <Card className={className} {...props}>
                {children}
            </Card>
        </motion.div>
    );
});

AnimatedCard.displayName = 'AnimatedCard';
