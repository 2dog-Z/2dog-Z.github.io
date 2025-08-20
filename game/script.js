// 大富翁游戏主逻辑
class MonopolyGame {
    constructor() {
        this.boardData = this.initializeBoardData();
        this.players = {
            player1: {
                name: '玩家1',
                money: 1500,
                position: 0,
                properties: [],
                inJail: false,
                jailTurns: 0
            },
            player2: {
                name: '玩家2',
                money: 1500,
                position: 0,
                properties: [],
                inJail: false,
                jailTurns: 0
            }
        };
        this.currentPlayer = 'player1';
        this.gameState = 'waiting'; // waiting, playing, ended
        this.diceRolled = false;
        this.moveSteps = 0;
        
        // GitHub API 相关
        this.githubRepo = '';
        this.githubToken = '';
        this.gameId = '';
        this.isOnline = false;
        this.lastIssueNumber = 0;
        
        this.initializeGame();
        this.setupEventListeners();
    }

    // 初始化棋盘数据
    initializeBoardData() {
        return [
            { name: '起点', type: 'start', price: 0, rent: 0, color: 'start' },
            { name: '中山路', type: 'property', price: 60, rent: 2, color: 'brown' },
            { name: '公共基金', type: 'community', price: 0, rent: 0, color: 'community' },
            { name: '嘉兴路', type: 'property', price: 60, rent: 4, color: 'brown' },
            { name: '所得税', type: 'tax', price: 0, rent: 200, color: 'tax' },
            { name: '南京火车站', type: 'station', price: 200, rent: 25, color: 'station' },
            { name: '安徽路', type: 'property', price: 100, rent: 6, color: 'lightblue' },
            { name: '机会', type: 'chance', price: 0, rent: 0, color: 'chance' },
            { name: '天津路', type: 'property', price: 100, rent: 6, color: 'lightblue' },
            { name: '北京路', type: 'property', price: 120, rent: 8, color: 'lightblue' },
            { name: '监狱', type: 'jail', price: 0, rent: 0, color: 'jail' },
            { name: '新街口', type: 'property', price: 140, rent: 10, color: 'pink' },
            { name: '电力公司', type: 'utility', price: 150, rent: 0, color: 'utility' },
            { name: '淮海路', type: 'property', price: 140, rent: 10, color: 'pink' },
            { name: '上海路', type: 'property', price: 160, rent: 12, color: 'pink' },
            { name: '上海火车站', type: 'station', price: 200, rent: 25, color: 'station' },
            { name: '南京路', type: 'property', price: 180, rent: 14, color: 'orange' },
            { name: '公共基金', type: 'community', price: 0, rent: 0, color: 'community' },
            { name: '北京路', type: 'property', price: 180, rent: 14, color: 'orange' },
            { name: '广州路', type: 'property', price: 200, rent: 16, color: 'orange' },
            { name: '免费停车', type: 'parking', price: 0, rent: 0, color: 'parking' },
            { name: '王府井', type: 'property', price: 220, rent: 18, color: 'red' },
            { name: '机会', type: 'chance', price: 0, rent: 0, color: 'chance' },
            { name: '西单', type: 'property', price: 220, rent: 18, color: 'red' },
            { name: '前门', type: 'property', price: 240, rent: 20, color: 'red' },
            { name: '北京火车站', type: 'station', price: 200, rent: 25, color: 'station' },
            { name: '中关村', type: 'property', price: 260, rent: 22, color: 'yellow' },
            { name: '清华大学', type: 'property', price: 260, rent: 22, color: 'yellow' },
            { name: '自来水公司', type: 'utility', price: 150, rent: 0, color: 'utility' },
            { name: '北京大学', type: 'property', price: 280, rent: 24, color: 'yellow' },
            { name: '进监狱', type: 'gotojail', price: 0, rent: 0, color: 'gotojail' },
            { name: '东方明珠', type: 'property', price: 300, rent: 26, color: 'green' },
            { name: '南京路步行街', type: 'property', price: 300, rent: 26, color: 'green' },
            { name: '公共基金', type: 'community', price: 0, rent: 0, color: 'community' },
            { name: '外滩', type: 'property', price: 320, rent: 28, color: 'green' },
            { name: '广州火车站', type: 'station', price: 200, rent: 25, color: 'station' },
            { name: '机会', type: 'chance', price: 0, rent: 0, color: 'chance' },
            { name: '天河城', type: 'property', price: 350, rent: 35, color: 'darkblue' },
            { name: '奢侈税', type: 'tax', price: 0, rent: 100, color: 'tax' },
            { name: '珠江新城', type: 'property', price: 400, rent: 50, color: 'darkblue' }
        ];
    }

    // 初始化游戏
    initializeGame() {
        this.createBoard();
        this.createPlayerPieces();
        this.updateUI();
        this.addLog('游戏开始！玩家1先行。');
    }

    // 创建棋盘
    createBoard() {
        const board = document.getElementById('board');
        board.innerHTML = '';
        
        this.boardData.forEach((cell, index) => {
            const cellElement = document.createElement('div');
            cellElement.className = `cell ${this.getCellPosition(index)} ${cell.color}`;
            cellElement.id = `cell-${index}`;
            cellElement.innerHTML = `
                <div class="cell-name">${cell.name}</div>
                ${cell.price > 0 ? `<div class="cell-price">$${cell.price}</div>` : ''}
            `;
            
            // 设置格子位置
            this.setCellPosition(cellElement, index);
            
            // 添加点击事件
            cellElement.addEventListener('click', () => this.showPropertyInfo(index));
            
            board.appendChild(cellElement);
        });
    }

    // 获取格子位置类型
    getCellPosition(index) {
        if (index === 0 || index === 10 || index === 20 || index === 30) {
            return 'corner';
        } else if (index < 10) {
            return 'bottom';
        } else if (index < 20) {
            return 'left';
        } else if (index < 30) {
            return 'top';
        } else {
            return 'right';
        }
    }

    // 设置格子位置
    setCellPosition(element, index) {
        const boardSize = 600;
        const cornerSize = 80;
        const sideSize = 60;
        
        if (index === 0) { // 起点 - 右下角
            element.style.bottom = '0px';
            element.style.right = '0px';
        } else if (index < 10) { // 底边 - 从右到左
            element.style.bottom = '0px';
            element.style.right = `${cornerSize + (index - 1) * sideSize}px`;
        } else if (index === 10) { // 监狱 - 左下角
            element.style.bottom = '0px';
            element.style.left = '0px';
        } else if (index < 20) { // 左边 - 从下到上
            element.style.left = '0px';
            element.style.bottom = `${cornerSize + (index - 11) * sideSize}px`;
        } else if (index === 20) { // 免费停车 - 左上角
            element.style.top = '0px';
            element.style.left = '0px';
        } else if (index < 30) { // 顶边 - 从左到右
            element.style.top = '0px';
            element.style.left = `${cornerSize + (index - 21) * sideSize}px`;
        } else if (index === 30) { // 进监狱 - 右上角
            element.style.top = '0px';
            element.style.right = '0px';
        } else { // 右边 - 从上到下
            element.style.right = '0px';
            element.style.top = `${cornerSize + (index - 31) * sideSize}px`;
        }
    }

    // 创建玩家棋子
    createPlayerPieces() {
        const board = document.getElementById('board');
        
        // 创建玩家1棋子
        const piece1 = document.createElement('div');
        piece1.className = 'player-piece player1';
        piece1.id = 'player1-piece';
        board.appendChild(piece1);
        
        // 创建玩家2棋子
        const piece2 = document.createElement('div');
        piece2.className = 'player-piece player2';
        piece2.id = 'player2-piece';
        board.appendChild(piece2);
        
        // 初始位置
        this.updatePlayerPosition('player1');
        this.updatePlayerPosition('player2');
    }

    // 更新玩家位置
    updatePlayerPosition(playerId) {
        const piece = document.getElementById(`${playerId}-piece`);
        const cell = document.getElementById(`cell-${this.players[playerId].position}`);
        
        if (piece && cell) {
            const cellRect = cell.getBoundingClientRect();
            const boardRect = document.getElementById('board').getBoundingClientRect();
            
            const offsetX = playerId === 'player1' ? 5 : 25;
            const offsetY = 5;
            
            piece.style.left = `${cellRect.left - boardRect.left + offsetX}px`;
            piece.style.top = `${cellRect.top - boardRect.top + offsetY}px`;
        }
    }

    // 设置事件监听器
    setupEventListeners() {
        // 掷骰子
        document.getElementById('roll-dice').addEventListener('click', () => this.rollDice());
        
        // 结束回合
        document.getElementById('end-turn').addEventListener('click', () => this.endTurn());
        
        // 购买地产
        document.getElementById('buy-property').addEventListener('click', () => this.buyProperty());
        
        // 重新开始
        document.getElementById('restart-game').addEventListener('click', () => this.restartGame());
        
        // 连接按钮
        document.getElementById('connect-btn').addEventListener('click', () => this.showConnectionModal());
        
        // 连接模态框
        document.getElementById('connect-confirm').addEventListener('click', () => this.connectToGitHub());
        document.getElementById('connect-cancel').addEventListener('click', () => this.hideConnectionModal());
        
        // 地产模态框
        document.getElementById('property-close').addEventListener('click', () => this.hidePropertyModal());
        document.getElementById('property-buy').addEventListener('click', () => this.buyPropertyFromModal());
    }

    // 掷骰子
    rollDice() {
        if (this.diceRolled || this.gameState !== 'playing') return;
        
        const dice1 = Math.floor(Math.random() * 6) + 1;
        const dice2 = Math.floor(Math.random() * 6) + 1;
        const total = dice1 + dice2;
        
        // 更新骰子显示
        document.getElementById('dice1').textContent = dice1;
        document.getElementById('dice2').textContent = dice2;
        
        // 添加动画效果
        document.querySelectorAll('.dice').forEach(dice => {
            dice.classList.add('rolling');
            setTimeout(() => dice.classList.remove('rolling'), 600);
        });
        
        this.moveSteps = total;
        this.diceRolled = true;
        
        this.addLog(`${this.players[this.currentPlayer].name} 掷出了 ${dice1} + ${dice2} = ${total}`);
        
        // 移动玩家
        setTimeout(() => this.movePlayer(total), 800);
        
        // 更新按钮状态
        document.getElementById('roll-dice').disabled = true;
    }

    // 移动玩家
    movePlayer(steps) {
        const player = this.players[this.currentPlayer];
        let newPosition = (player.position + steps) % 40;
        
        // 检查是否经过起点
        if (player.position + steps >= 40) {
            player.money += 200;
            this.addLog(`${player.name} 经过起点，获得 $200`);
        }
        
        player.position = newPosition;
        this.updatePlayerPosition(this.currentPlayer);
        
        // 添加移动动画
        const piece = document.getElementById(`${this.currentPlayer}-piece`);
        piece.classList.add('moving');
        setTimeout(() => piece.classList.remove('moving'), 500);
        
        // 处理落地事件
        setTimeout(() => this.handleLanding(), 600);
        
        this.updateUI();
    }

    // 处理落地事件
    handleLanding() {
        const player = this.players[this.currentPlayer];
        const cell = this.boardData[player.position];
        
        this.addLog(`${player.name} 到达了 ${cell.name}`);
        
        switch (cell.type) {
            case 'property':
            case 'station':
            case 'utility':
                this.handlePropertyLanding(cell, player.position);
                break;
            case 'tax':
                this.handleTax(cell);
                break;
            case 'gotojail':
                this.goToJail();
                break;
            case 'chance':
            case 'community':
                this.handleCard(cell.type);
                break;
        }
        
        // 启用结束回合按钮
        document.getElementById('end-turn').disabled = false;
    }

    // 处理地产落地
    handlePropertyLanding(cell, position) {
        const owner = this.findPropertyOwner(position);
        
        if (!owner) {
            // 无主地产，可以购买
            document.getElementById('buy-property').disabled = false;
            this.addLog(`${cell.name} 无人拥有，可以购买！价格: $${cell.price}`);
        } else if (owner !== this.currentPlayer) {
            // 需要付租金
            const rent = this.calculateRent(cell, position);
            this.payRent(owner, rent);
        }
    }

    // 查找地产拥有者
    findPropertyOwner(position) {
        for (let playerId in this.players) {
            if (this.players[playerId].properties.includes(position)) {
                return playerId;
            }
        }
        return null;
    }

    // 计算租金
    calculateRent(cell, position) {
        return cell.rent;
    }

    // 支付租金
    payRent(ownerPlayerId, amount) {
        const currentPlayer = this.players[this.currentPlayer];
        const owner = this.players[ownerPlayerId];
        
        if (currentPlayer.money >= amount) {
            currentPlayer.money -= amount;
            owner.money += amount;
            this.addLog(`${currentPlayer.name} 向 ${owner.name} 支付租金 $${amount}`);
        } else {
            this.addLog(`${currentPlayer.name} 资金不足，无法支付租金！`);
            this.handleBankruptcy();
        }
    }

    // 购买地产
    buyProperty() {
        const player = this.players[this.currentPlayer];
        const cell = this.boardData[player.position];
        
        if (player.money >= cell.price) {
            player.money -= cell.price;
            player.properties.push(player.position);
            this.addLog(`${player.name} 购买了 ${cell.name}，花费 $${cell.price}`);
            
            // 更新地产显示
            const cellElement = document.getElementById(`cell-${player.position}`);
            cellElement.classList.add(`owned-${this.currentPlayer}`);
            
            document.getElementById('buy-property').disabled = true;
        } else {
            this.addLog(`${player.name} 资金不足，无法购买 ${cell.name}`);
        }
        
        this.updateUI();
    }

    // 处理税收
    handleTax(cell) {
        const player = this.players[this.currentPlayer];
        const tax = cell.rent;
        
        if (player.money >= tax) {
            player.money -= tax;
            this.addLog(`${player.name} 缴纳税款 $${tax}`);
        } else {
            this.addLog(`${player.name} 资金不足，无法缴纳税款！`);
            this.handleBankruptcy();
        }
    }

    // 进监狱
    goToJail() {
        const player = this.players[this.currentPlayer];
        player.position = 10; // 监狱位置
        player.inJail = true;
        player.jailTurns = 0;
        
        this.updatePlayerPosition(this.currentPlayer);
        this.addLog(`${player.name} 被关进监狱！`);
    }

    // 处理机会/公共基金卡片
    handleCard(type) {
        const cards = type === 'chance' ? this.getChanceCards() : this.getCommunityCards();
        const card = cards[Math.floor(Math.random() * cards.length)];
        
        this.addLog(`${type === 'chance' ? '机会' : '公共基金'}: ${card.text}`);
        card.action(this.players[this.currentPlayer]);
        this.updateUI();
    }

    // 获取机会卡片
    getChanceCards() {
        return [
            {
                text: '前进到起点，获得$200',
                action: (player) => {
                    player.position = 0;
                    player.money += 200;
                    this.updatePlayerPosition(this.currentPlayer);
                }
            },
            {
                text: '银行错误，获得$200',
                action: (player) => player.money += 200
            },
            {
                text: '缴纳罚款$50',
                action: (player) => player.money = Math.max(0, player.money - 50)
            }
        ];
    }

    // 获取公共基金卡片
    getCommunityCards() {
        return [
            {
                text: '获得遗产$100',
                action: (player) => player.money += 100
            },
            {
                text: '医疗费$50',
                action: (player) => player.money = Math.max(0, player.money - 50)
            },
            {
                text: '所得税退税$20',
                action: (player) => player.money += 20
            }
        ];
    }

    // 结束回合
    endTurn() {
        if (this.isOnline) {
            this.sendMoveToGitHub();
        }
        
        this.currentPlayer = this.currentPlayer === 'player1' ? 'player2' : 'player1';
        this.diceRolled = false;
        this.moveSteps = 0;
        
        // 重置按钮状态
        document.getElementById('roll-dice').disabled = false;
        document.getElementById('end-turn').disabled = true;
        document.getElementById('buy-property').disabled = true;
        
        this.updateUI();
        this.addLog(`轮到 ${this.players[this.currentPlayer].name}`);
        
        if (this.isOnline && this.currentPlayer === 'player2') {
            this.waitForOpponentMove();
        }
    }

    // 处理破产
    handleBankruptcy() {
        const player = this.players[this.currentPlayer];
        const opponent = this.currentPlayer === 'player1' ? 'player2' : 'player1';
        
        this.addLog(`${player.name} 破产了！${this.players[opponent].name} 获胜！`);
        this.gameState = 'ended';
        
        // 禁用所有按钮
        document.getElementById('roll-dice').disabled = true;
        document.getElementById('end-turn').disabled = true;
        document.getElementById('buy-property').disabled = true;
    }

    // 更新UI
    updateUI() {
        // 更新玩家信息
        document.getElementById('player1-money').textContent = this.players.player1.money;
        document.getElementById('player2-money').textContent = this.players.player2.money;
        
        document.getElementById('player1-position').textContent = this.boardData[this.players.player1.position].name;
        document.getElementById('player2-position').textContent = this.boardData[this.players.player2.position].name;
        
        // 更新当前玩家显示
        document.getElementById('current-turn').textContent = this.players[this.currentPlayer].name;
        
        // 更新地产列表
        this.updatePropertiesList('player1');
        this.updatePropertiesList('player2');
    }

    // 更新地产列表
    updatePropertiesList(playerId) {
        const container = document.getElementById(`${playerId}-properties`);
        container.innerHTML = '';
        
        this.players[playerId].properties.forEach(position => {
            const property = this.boardData[position];
            const card = document.createElement('div');
            card.className = 'property-card';
            card.textContent = property.name;
            container.appendChild(card);
        });
    }

    // 添加日志
    addLog(message) {
        const logContent = document.getElementById('log-content');
        const logEntry = document.createElement('div');
        logEntry.textContent = message;
        logContent.appendChild(logEntry);
        logContent.scrollTop = logContent.scrollHeight;
    }

    // 显示地产信息
    showPropertyInfo(position) {
        const cell = this.boardData[position];
        if (cell.type === 'property' || cell.type === 'station' || cell.type === 'utility') {
            const modal = document.getElementById('property-modal');
            const title = document.getElementById('property-title');
            const details = document.getElementById('property-details');
            const buyBtn = document.getElementById('property-buy');
            
            title.textContent = cell.name;
            details.innerHTML = `
                <p>类型: ${this.getTypeText(cell.type)}</p>
                <p>价格: $${cell.price}</p>
                <p>租金: $${cell.rent}</p>
            `;
            
            const owner = this.findPropertyOwner(position);
            if (owner) {
                details.innerHTML += `<p>拥有者: ${this.players[owner].name}</p>`;
                buyBtn.style.display = 'none';
            } else {
                buyBtn.style.display = 'inline-block';
                buyBtn.onclick = () => {
                    if (this.players[this.currentPlayer].position === position) {
                        this.buyProperty();
                    }
                    this.hidePropertyModal();
                };
            }
            
            modal.classList.add('show');
        }
    }

    // 获取类型文本
    getTypeText(type) {
        const types = {
            'property': '地产',
            'station': '火车站',
            'utility': '公用事业'
        };
        return types[type] || type;
    }

    // 隐藏地产模态框
    hidePropertyModal() {
        document.getElementById('property-modal').classList.remove('show');
    }

    // 从模态框购买地产
    buyPropertyFromModal() {
        this.buyProperty();
        this.hidePropertyModal();
    }

    // 重新开始游戏
    restartGame() {
        // 重置玩家数据
        this.players.player1 = {
            name: '玩家1',
            money: 1500,
            position: 0,
            properties: [],
            inJail: false,
            jailTurns: 0
        };
        this.players.player2 = {
            name: '玩家2',
            money: 1500,
            position: 0,
            properties: [],
            inJail: false,
            jailTurns: 0
        };
        
        this.currentPlayer = 'player1';
        this.gameState = 'playing';
        this.diceRolled = false;
        this.moveSteps = 0;
        
        // 重新创建棋盘
        this.createBoard();
        this.createPlayerPieces();
        
        // 重置按钮状态
        document.getElementById('roll-dice').disabled = false;
        document.getElementById('end-turn').disabled = true;
        document.getElementById('buy-property').disabled = true;
        
        // 清空日志
        document.getElementById('log-content').innerHTML = '';
        
        this.updateUI();
        this.addLog('游戏重新开始！玩家1先行。');
    }

    // 显示连接模态框
    showConnectionModal() {
        document.getElementById('connection-modal').classList.add('show');
    }

    // 隐藏连接模态框
    hideConnectionModal() {
        document.getElementById('connection-modal').classList.remove('show');
    }

    // 连接到GitHub
    async connectToGitHub() {
        const repo = document.getElementById('github-repo').value;
        const keyPart1 = document.getElementById('api-key-part1').value;
        const keyPart2 = document.getElementById('api-key-part2').value;
        const playerName = document.getElementById('player-name').value;
        
        if (!repo || !keyPart1 || !keyPart2 || !playerName) {
            alert('请填写所有必要信息');
            return;
        }
        
        // 组合API密钥
        this.githubToken = keyPart1 + keyPart2;
        this.githubRepo = repo;
        this.gameId = `monopoly-${Date.now()}`;
        
        try {
            // 测试API连接
            const response = await fetch(`https://api.github.com/repos/${repo}`, {
                headers: {
                    'Authorization': `token ${this.githubToken}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });
            
            if (response.ok) {
                this.isOnline = true;
                this.players.player1.name = playerName;
                
                // 更新状态显示
                const statusIndicator = document.getElementById('status-indicator');
                statusIndicator.textContent = '已连接';
                statusIndicator.classList.add('connected');
                
                // 创建游戏房间
                await this.createGameRoom();
                
                this.gameState = 'playing';
                this.hideConnectionModal();
                this.addLog(`${playerName} 已连接到游戏！`);
                
                // 开始监听对手动作
                this.startListening();
            } else {
                throw new Error('连接失败');
            }
        } catch (error) {
            alert('连接失败，请检查仓库名称和API密钥');
            console.error('连接错误:', error);
        }
    }

    // 创建游戏房间
    async createGameRoom() {
        const issueData = {
            title: `大富翁游戏房间 - ${this.gameId}`,
            body: JSON.stringify({
                gameId: this.gameId,
                player1: this.players.player1.name,
                gameState: this.getGameState(),
                timestamp: Date.now()
            }),
            labels: ['monopoly-game']
        };
        
        try {
            const response = await fetch(`https://api.github.com/repos/${this.githubRepo}/issues`, {
                method: 'POST',
                headers: {
                    'Authorization': `token ${this.githubToken}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(issueData)
            });
            
            if (response.ok) {
                const issue = await response.json();
                this.lastIssueNumber = issue.number;
                this.addLog('游戏房间已创建，等待玩家2加入...');
            }
        } catch (error) {
            console.error('创建游戏房间失败:', error);
        }
    }

    // 发送移动到GitHub
    async sendMoveToGitHub() {
        if (!this.isOnline) return;
        
        const moveData = {
            player: this.currentPlayer,
            gameState: this.getGameState(),
            timestamp: Date.now()
        };
        
        try {
            await fetch(`https://api.github.com/repos/${this.githubRepo}/issues/${this.lastIssueNumber}/comments`, {
                method: 'POST',
                headers: {
                    'Authorization': `token ${this.githubToken}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    body: JSON.stringify(moveData)
                })
            });
        } catch (error) {
            console.error('发送移动失败:', error);
        }
    }

    // 获取游戏状态
    getGameState() {
        return {
            players: this.players,
            currentPlayer: this.currentPlayer,
            gameState: this.gameState,
            boardData: this.boardData
        };
    }

    // 开始监听对手动作
    startListening() {
        if (!this.isOnline) return;
        
        setInterval(async () => {
            try {
                const response = await fetch(`https://api.github.com/repos/${this.githubRepo}/issues/${this.lastIssueNumber}/comments`, {
                    headers: {
                        'Authorization': `token ${this.githubToken}`,
                        'Accept': 'application/vnd.github.v3+json'
                    }
                });
                
                if (response.ok) {
                    const comments = await response.json();
                    this.processOpponentMoves(comments);
                }
            } catch (error) {
                console.error('监听失败:', error);
            }
        }, 3000); // 每3秒检查一次
    }

    // 处理对手移动
    processOpponentMoves(comments) {
        // 处理新的评论/移动
        comments.forEach(comment => {
            try {
                const moveData = JSON.parse(comment.body);
                if (moveData.player !== this.currentPlayer && moveData.timestamp > this.lastProcessedTimestamp) {
                    this.applyOpponentMove(moveData);
                    this.lastProcessedTimestamp = moveData.timestamp;
                }
            } catch (error) {
                // 忽略非游戏数据的评论
            }
        });
    }

    // 应用对手移动
    applyOpponentMove(moveData) {
        // 更新游戏状态
        this.players = moveData.gameState.players;
        this.currentPlayer = moveData.gameState.currentPlayer;
        
        // 更新UI
        this.updateUI();
        this.updatePlayerPosition('player1');
        this.updatePlayerPosition('player2');
        
        this.addLog('对手完成了移动');
    }

    // 等待对手移动
    waitForOpponentMove() {
        document.getElementById('roll-dice').disabled = true;
        this.addLog('等待对手移动...');
    }
}

// 初始化游戏
let game;
document.addEventListener('DOMContentLoaded', () => {
    game = new MonopolyGame();
});

// 防止页面刷新时丢失游戏状态
window.addEventListener('beforeunload', (e) => {
    if (game && game.isOnline && game.gameState === 'playing') {
        e.preventDefault();
        e.returnValue = '游戏正在进行中，确定要离开吗？';
    }
});