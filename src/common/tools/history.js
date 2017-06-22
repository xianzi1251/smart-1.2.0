/**
 * 一个通用的历史记录器
 *
 * ## 历史节点
 *
 * 历史记录器内维护一组历史节点对象，
 * 节点对象内包含一个 `$id` 属性，表示该节点的 ID，该 ID 值为常量，永不可变。
 * 并包含 `$nextNode` 及 `$prevNode` 两个属性，分别表示当前节点的下一个节点及上一个节点，
 * 通过这两个属性以形成一个链表结构。若 `$nextNode` 为空，则表示该节点为最后一个节点，
 * 同样，若 `$prevNode` 为空则表示该节点为第一个节点。
 *
 * 另外，节点对象内包含一个隐藏属性 `$__history__`，指向该节点所在的历史记录器，该属性不可被外部调用。
 *
 * 在历史记录器内部，会维护一个索引表 `indexList`，该索引表中以节点的 ID 为索引值存储当前历史记录器内所维护的所有历史节点。
 * 并有一个 `firstNode` 属性存放节点链表中的第一个节点，以及一个 `lastNode` 属性存放最后一个节点。
 *
 * @example
 *
 *     function(History) {
 *         var history = new History();
 *     }
 */
angular.module('app.services').service('History', function() {
    // 一个计数器，用于生成历史节点的 ID，因为 count 是全局的，因此历史节点的 ID 也是全局唯一的。
    var count = 0;

    function History() {
        // 一个查询表，记录所有的历史节点，以历史节点的 id 为索引值
        this.indexList = {};

        // 历史节点链中的第一个节点
        this.firstNode = undefined;

        // 历史节点链中的最后一个节点
        this.lastNode = undefined;

        // 当前节点
        this.currentNode = undefined;
    }

    _.assign(History.prototype, {

        /**
         * 从当前历史记录中移除所传入的节点
         * @param flag {*} 节点标记；若为数字，则视为节点 ID，否则一律视为节点对象
         */
        remove: function(flag) {
            var node = this._getNode(flag);

            var history = node.$__history__,
                prevNode = node.$prevNode,
                nextNode = node.$nextNode;

            node.$prevNode = undefined;
            node.$nextNode = undefined;
            node.$__history__ = undefined;
            delete history.indexList[node.$id];

            if (prevNode) {
                prevNode.$nextNode = nextNode;
            }
            else {
                history.firstNode = nextNode;
            }

            if (nextNode) {
                nextNode.$prevNode = prevNode;
            }
            else {
                history.lastNode = prevNode;
            }

            if (history.currentNode === node) {
                // TODO: 这里修改了当前节点，但却没有发出通知
                history.currentNode = nextNode || prevNode || undefined;
            }
        },

        /**
         * 插入历史节点
         */
        insertBefore: function(node, referenceNodeFlag) {
            node = createNode(node);

            // 获取参照节点
            var referenceNode = this._getNode(referenceNodeFlag);

            if (!referenceNode) {
                throw '参照节点不在该历史记录器中';
            }

            // 如果待插入的节点不归当前历史记录器所管理，则先将其从其所在的历史记录器中删除
            if (!this.indexList[node.$id]) {
                node.$__history__ && node.$__history__.remove(node);
            }

            // 将待插入节点放入当前历史记录器中
            node.$__history__ = this;
            this.indexList[node.id] = node;

            // 插入历史节点
            var prevNode = referenceNode.prevNode;

            if (prevNode) {
                prevNode.$nextNode = node;
                node.$prevNode = prevNode;
            }
            else {
                this.firstNode = node;
            }

            referenceNode.$prevNode = node;
            node.$nextNode = referenceNode;
        },

        /**
         * 将某个节点插入到当前历史记录链的末尾，作为最后一个节点
         * @param node {Object} 待插入的节点
         */
        appendNode: function(node) {
            node = createNode(node);

            // 如果待插入的节点不归当前历史记录器所管理，则先将其从其所在的历史记录器中删除
            if (!this.indexList[node.$id]) {
                node.$__history__ && node.$__history__.remove(node);
            }

            // 将待插入节点放入当前历史记录器中
            node.$__history__ = this;
            this.indexList[node.$id] = node;

            // 将当前的最后一个节点作为待插入节点的上一个节点
            var prevNode = this.lastNode;

            if (prevNode) {
                prevNode.$nextNode = node;
                node.$prevNode = prevNode;
            }
            else {
                this.firstNode = node;
            }

            // 将待插入节点作为新的最后一个节点
            this.lastNode = node;
        },

        /**
         * 获取历史节点
         * @param flag {*} 节点标记；若为数字，则视为节点 ID，否则一律视为节点对象
         * @return 若能从当前历史记录链中找到所传入标记代表的节点，则返回该节点，否则返回 undefined。
         */
        _getNode: function(flag) {
            var id, node;

            if (typeof flag === 'object' && flag.$isHistoryNode) {
                node = flag;
                return this.indexList[node.$id] === node ? node : undefined;
            }
            else if (typeof flag === 'number') {
                id = flag;
                return this.indexList[id];
            }
            else if (flag === 'last') {
                return this.lastNode;
            }
            else if (flag === 'first') {
                return this.firstNode;
            }
            else {
                return undefined;
            }
        }
    });

    /**
     * 创建历史节点
     */
    function createNode(node) {
        if (node && node.$isHistoryNode) {
            return node;
        }

        var node = node || {},
            id = count++;

        node.$id = id;              // 节点 ID
        node.$isHistoryNode = true; // 节点标记，用于识别是否是一个历史节点

        return node;
    }

    return History;

});
