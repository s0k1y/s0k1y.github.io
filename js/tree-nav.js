// 树状导航折叠功能
var STORAGE_KEY = 'tree-nav-expanded';

function getExpandedSet() {
  try {
    var data = localStorage.getItem(STORAGE_KEY);
    return data ? new Set(JSON.parse(data)) : new Set();
  } catch (e) {
    return new Set();
  }
}

function saveExpandedSet(set) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(set)));
  } catch (e) {}
}

function getNodeKey(node) {
  var link = node.querySelector('a');
  return link ? link.getAttribute('href') : '';
}

function toggleExpand(iconElement, event) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }
  var node = iconElement.closest('.tree-nav-node');
  var children = node.nextElementSibling;

  if (children && children.classList.contains('tree-nav-children')) {
    children.classList.toggle('expanded');
    iconElement.classList.toggle('rotated');

    var expanded = getExpandedSet();
    var key = getNodeKey(node);
    if (key) {
      if (children.classList.contains('expanded')) {
        expanded.add(key);
      } else {
        expanded.delete(key);
      }
      saveExpandedSet(expanded);
    }
  }
}

// 页面加载后恢复展开状态并自动展开当前分类的祖先节点
document.addEventListener('DOMContentLoaded', function() {
  // 1. 从localStorage恢复之前手动展开的节点
  var expanded = getExpandedSet();
  document.querySelectorAll('.tree-nav-node').forEach(function(node) {
    var key = getNodeKey(node);
    if (key && expanded.has(key)) {
      var children = node.nextElementSibling;
      if (children && children.classList.contains('tree-nav-children')) {
        children.classList.add('expanded');
        var icon = node.querySelector('.tree-expand-icon');
        if (icon) icon.classList.add('rotated');
      }
    }
  });

  // 2. 自动展开当前分类的所有祖先节点
  document.querySelectorAll('.tree-nav-node.active').forEach(function(activeNode) {
    var el = activeNode.parentElement;
    while (el) {
      if (el.classList && el.classList.contains('tree-nav-children')) {
        el.classList.add('expanded');
        var prevNode = el.previousElementSibling;
        if (prevNode && prevNode.classList.contains('tree-nav-node')) {
          var icon = prevNode.querySelector('.tree-expand-icon');
          if (icon) icon.classList.add('rotated');
          // 同步到localStorage
          var key = getNodeKey(prevNode);
          if (key) {
            expanded.add(key);
          }
        }
      }
      el = el.parentElement;
    }
    saveExpandedSet(expanded);
  });
});
