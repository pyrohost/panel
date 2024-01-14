import type { ReactNode } from 'react';
import { useEffect } from 'react';
import tw from 'twin.macro';

import ContentContainer from '@/components/elements/ContentContainer';
import FlashMessageRender from '@/components/FlashMessageRender';

export interface PageContentBlockProps {
    children?: ReactNode;

    title?: string;
    className?: string;
    showFlashKey?: string;
}

function PageContentBlock({ title, showFlashKey, className, children }: PageContentBlockProps) {
    useEffect(() => {
        if (title) {
            document.title = title;
        }
    }, [title]);

    return (
        <>
            <ContentContainer css={tw`my-4 sm:my-10`} className={className}>
                {showFlashKey && <FlashMessageRender byKey={showFlashKey} css={tw`mb-4`} />}
                {children}
            </ContentContainer>
        </>
    );
}

export default PageContentBlock;
