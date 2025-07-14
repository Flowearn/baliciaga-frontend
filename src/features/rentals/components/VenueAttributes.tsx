// frontend/src/features/rentals/components/VenueAttributes.tsx
import React from 'react';

// 定义传入的props类型
interface VenueAttributesProps {
  cuisineStyle?: string[];
  atmosphere?: string[];
  signatureDishes?: string[];
}

// 这是一个内部辅助组件，用于渲染每个单独的部分
const AttributeSection: React.FC<{ title: string; items?: string[] }> = ({ title, items }) => {
  // 如果没有数据或数据数组为空，则不渲染这个部分
  if (!items || items.length === 0 || (items.length === 1 && items[0] === '')) {
    return null;
  }

  return (
    <div className="mb-4 last:mb-0">
      <h3 className="text-sm font-bold text-white/60 uppercase tracking-wider mb-3">{title}</h3>
      <div className="flex flex-wrap gap-2">
        {items.map((item, index) => (
          // 这是"非交互式标签"的样式
          <div key={index} className="bg-white/10 text-white/90 text-sm font-medium px-3 py-1.5 rounded-lg border border-white/10">
            {item}
          </div>
        ))}
      </div>
    </div>
  );
};

// 这是对外暴露的主组件
export const VenueAttributes: React.FC<VenueAttributesProps> = ({ cuisineStyle, atmosphere, signatureDishes }) => {
  // 如果所有数据都为空，则不渲染任何东西
  if (!cuisineStyle?.length && !atmosphere?.length && !signatureDishes?.length) {
    return null;
  }

  return (
    // 这是"内容容器"的样式，使用了我们调查发现的 bg-black/40 和 rounded-xl
    <div className="my-4 p-4 bg-black/40 rounded-xl">
      <AttributeSection title="Cuisine Style" items={cuisineStyle} />
      <AttributeSection title="Atmosphere" items={atmosphere} />
      <AttributeSection title="Signature Dishes" items={signatureDishes} />
    </div>
  );
};