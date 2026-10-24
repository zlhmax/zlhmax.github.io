/**
 * remark-spoiler（本站自建，无需额外依赖）
 *
 * 行内语法：
 *   ||文字||      → 模糊（blur）
 *   |||文字|||    → 黑条遮盖（blackout）
 *
 * 输出：
 *   <span class="blur-wrapper" data-mode="blur|blackout" data-hidden="true"
 *         role="button" tabindex="0" aria-expanded="false">
 *     <span class="blur-content">文字</span>
 *   </span>
 *
 * 展开/收起由文章页脚本处理（点击、Enter、空格）。
 */

function escapeHtml(value) {
    return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/** 把一段纯文本拆成 [文本节点 | 遮罩 span] 数组 */
function splitSpoilers(value) {
    const pattern = /(\|\|\||\|\|)([^|]+)\1/g;
    const out = [];
    let lastIndex = 0;
    let match;

    while ((match = pattern.exec(value)) !== null) {
        if (match.index > lastIndex) {
            out.push({ type: "text", value: value.slice(lastIndex, match.index) });
        }
        const mode = match[1].length === 3 ? "blackout" : "blur";
        const text = escapeHtml(match[2].trim());
        out.push({
            type: "html",
            value:
                `<span class="blur-wrapper" data-mode="${mode}" data-hidden="true" ` +
                `role="button" tabindex="0" aria-expanded="false">` +
                `<span class="blur-content">${text}</span></span>`,
        });
        lastIndex = match.index + match[0].length;
    }

    if (!out.length) return null;
    if (lastIndex < value.length) {
        out.push({ type: "text", value: value.slice(lastIndex) });
    }
    return out;
}

function processParent(parent) {
    const next = [];
    for (const child of parent.children) {
        if (child.type === "text") {
            const split = splitSpoilers(child.value);
            if (split) {
                next.push(...split);
                continue;
            }
            next.push(child);
            continue;
        }
        // 跳过代码块与行内代码，避免误伤
        if (
            child.type !== "code" &&
            child.type !== "inlineCode" &&
            Array.isArray(child.children)
        ) {
            processParent(child);
        }
        next.push(child);
    }
    parent.children = next;
}

export default function remarkSpoiler() {
    return (tree) => {
        processParent(tree);
    };
}
