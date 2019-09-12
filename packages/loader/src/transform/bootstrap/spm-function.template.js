/* global SPMA */

;+function(spmA) { /* eslint-disable-line */
  if (!spmA) return;

  // 查找相关标签
  const spmAElt = document.head.querySelector('[name="data-spm"]');

  // 如果相关 meta 标签存在，并且内容也存在
  if (spmAElt && spmAElt.content) return;

  // 删除无效的标签
  if(spmAElt) { /* eslint-disable-line */
    spmAElt.remove();
  }

  // 插入相关 A 码配置
  const meta = document.createElement('meta');
  meta.name = 'data-spm';
  meta.content = spmA;
  document.head.appendChild(meta);
}(SPMA);
