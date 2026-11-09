'use client';

import HelpShell from '@/components/help/HelpShell';
import MySpace from '@/components/myspace/MySpace';

export default function MySpacePage() {
  return (
    <HelpShell back="/help" showLanguage={false}>
      <MySpace />
    </HelpShell>
  );
}
