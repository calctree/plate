import { cn } from '@udecode/cn';
import Link from 'next/link';

import { Button } from '@/registry/default/plate-ui/button';
import { getI18nContent } from '@/utils/getI18nConent';

import { siteConfig } from '../config/site';

const i18n = {
  Chinese: {
    buildYourEditor: '构建你的编辑器',
    getAccess: '获取全部访问权限',
    productionReady: '生产就绪的 AI 模板和可重用的组件。',
  },
  English: {
    buildYourEditor: 'Build your editor',
    getAccess: 'Get all-access',
    productionReady: 'Production-ready AI template and reusable components.',
  },
};

export function OpenInPlus({ className }: { className?: string }) {
  const content = getI18nContent(i18n);

  return (
    <div
      className={cn(
        'group relative flex flex-col gap-2 rounded-lg border bg-card p-4 text-sm',
        className
      )}
    >
      <div className="text-balance text-lg font-semibold leading-tight group-hover:underline">
        {content.buildYourEditor}
      </div>
      <div>{content.productionReady}</div>
      <Button size="sm" className="mt-2 w-fit shrink-0">
        {content.getAccess}
      </Button>
      <Link
        className="absolute inset-0"
        href={`${siteConfig.links.platePro}`}
        rel="noreferrer"
        target="_blank"
      >
        <span className="sr-only">{content.getAccess}</span>
      </Link>
    </div>
  );
}
