//===== 从数据坐标选定单元格 =====
function coorToCell(x, y) {  //这里的坐标已经是数据坐标
    let R = Math.floor(y / rsp);
    let C = -1;

    if (R < 0 || R >= rowcount) {
        R = -1;
        return { R, C }
    };

    if (y > sumrsp(R) + 3 * fonth) {
        R = -1;
        return { R, C }
    };

    const len = table[R].length;

    if (x < table[R][0].x - 0.5 * fonth || x > table[R][len - 1].x + 0.5 * fonth) {
        R = -1;
        return { R, C }
    };

    if (len == 1) {
        if (x >= table[R][0].x - 0.5 * fonth && x <= table[R][0].x + 0.5 * fonth) C = 0;
        else C = -1;

    } else if (len > 1) {
        for (let i = 0; i < len - 1; i++) {
            const e1 = table[R][i];
            const e2 = table[R][i + 1];
            if (x >= e1.x - 0.5 * fonth && x <= e2.x + 0.5 * fonth) {
                if (x >= e1.x - 0.5 * fonth && x <= e1.x + 0.5 * fonth) C = i;
                else if(x >= e2.x - 0.5 * fonth && x <= e2.x + 0.5 * fonth) C = i + 1;
                else C = -1;
                break;
            }
        }
    }  

    if (C == -1) R = -1;
    return { R, C };
}

//===== 做分支显示(!!!!! 屏幕操作全部回到这里执行)
function doBranch(cell) {
    if (!cell) return;
    doPositioning(cell);
    doDraw()
}

//===== 光标点击 =============
function onCanvasClick(x, y) {
    x = xtod(x);                //屏幕到数据
    y = ytod(y);              
    let { R, C } = coorToCell(x, y);
    if (R < 0 || C < 0) return;
    selcell = toEle(R, C)
    doBranch(selcell);
}

//===== 做平移 ========
function doTrans(diffx,diffy){
    transy += diffy;
    transx += diffx;

    if(diffy < 0){                  //上移睇底限 bLim:普遍<0 特殊>0
        if(bLim > 0)transy=0;      
        else if(transy < bLim) transy=bLim;
    } else if(diffy > 0){           //下移睇顶限 tLim:普遍=0 特殊=0
          if(transy > 0) transy=0;
    };

    if(diffx < 0){                  //左移睇右限  rLim:正常<0 特殊>0
        if(rLim >0) transx=0;
        else if(transx < rLim) transx = rLim;

    }else if(diffx > 0){            //右移睇左限 lLim:正常>0 特殊<0
        if(lLim <0) transx=0;
        else if(transx > lLim) transx = lLim;
        
    } 

    document.getElementById("iLabel").textContent = `transx=${transx}  transy=${transy}  diffx=${diffx}  diffy=${diffy} `;
    doDraw()
}

//===== 光标按压移动 ========
function onDownMove(x, y) {
    let diffx = x - oldx;
    let diffy = y - oldy; 
    oldx = x;
    oldy = y;
    doTrans(diffx,diffy)     
}

//===== 光标移动 ========
function onMouseMove(x, y) {
    displayCoor(x, y)
}

//===== 光标向下 ===========
function onMouseDown(x, y) {
    if (isDown) {
        oldx = x;
        oldy = y;
    }
}

//===== 光标弹起 ===========
function onMouseUp(x, y) {

}

//------------------------
function displayCoor(x, y) {
    // document.getElementById("iLabel").textContent = `x = ${x},  y=${y}`;

}

//%%%%%%% 下面是绘画图表 %%%%%%%%%%%%%
function inside(cell){
    const x = xtoc(cell.x);
    const y = ytoc(cell.y);
    if(x +0.5*fonth < 0 || x -0.5*fonth > cwidth || y +rsp < 0 || y - 3*fonth > cheight ) return false;
    return true;
}

function ctopline(ctx,p){
    const x = xtoc(p.x);
    const y = ytoc(p.y) + 3*fonth;
   
    let {X1,X2,Y1} = childcoor(p);
    X1 = xtoc(X1) - 0.5*fonth;
    X2 = xtoc(X2) + 0.5*fonth;
    Y1 = ytoc(Y1) -4;

    ctx.strokeStyle = "blue";
    ctx.lineWidth = 1;

    ctx.moveTo(X1, Y1);
    ctx.lineTo(X2, Y1);
    ctx.stroke();

    X2 = 0.5 * (X1 + X2);
    ctx.moveTo(x, y);
    ctx.lineTo(X2, Y1);
    ctx.stroke();
}

function drawName(ctx, cell) {
    const x = xtoc(cell.x);
    const y = ytoc(cell.y) + 0.5*fonth;

    if(x +0.5*fonth < 0 || x -0.5*fonth > cwidth || y +rsp < 0 || y - 3*fonth > cheight ) return;

    ctx.save();                                         // 保存当前状态

    if (cell.sel == 16) ctx.fillStyle = "#ec4899"
    else if (cell.sel > 0) ctx.fillStyle = "#f87171"
    else ctx.fillStyle = " #555555";

    ctx.translate(x, y);                                // 移动画布原点到指定位置

    let len = cell.name.length;
    //ctx.rotate(90 * Math.PI / 180);                   // 旋转画布到指定角度（角度转弧度）

    for (let i = 0; i < len; i++) {
        if (len == 2 && i == 1) ctx.fillText(cell.name[i], 0, 2 * fonth);
        else ctx.fillText(cell.name[i], 0, i * fonth);  // 逐个字符绘制，调整y坐标以实现垂直排列效果（字符间距根据需要调整）
    };

    if (!hasKc(cell)) {
        ctx.restore();         
        return;
    };

    let {X1,X2,Y1} = childcoor(cell);
    X1 = xtoc(X1) - x -0.5*fonth;
    X2 = xtoc(X2) - x +0.5*fonth;
    Y1 = ytoc(Y1) - y-4;

    ctx.strokeStyle = "blue";
    ctx.lineWidth = 1;

    ctx.moveTo(X1, Y1);
    ctx.lineTo(X2, Y1);
    ctx.stroke();

    X2 = 0.5 * (X1 + X2);
    ctx.moveTo(0, Math.trunc(2.5*fonth));
    ctx.lineTo(X2, Y1);
    ctx.stroke();

    ctx.restore();              // 恢复之前保存的状态 
    
}


function doDraw() {
    resizeCanvas();
    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.scale(dpr, dpr);
    ctx.translate(0, 0);


    // 5. 强制文字渲染最优
    ctx.imageSmoothingEnabled = true;
    ctx.webkitImageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    ctx.font = `bold ${fonth}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // s="start\n";
    for (let j = 0; j < table.length; j++) {
        for (let i = 0; i < table[j].length; i++) {
            let cell = table[j][i];
            drawName(ctx, cell);
            if(inside(cell) && hasKp(cell) && !inside(cell.parent())) ctopline(ctx,cell.parent())
            
        }
    }
    // console.log(s)
}

function prepare() {
    if (selcell == null) selcell = toEle(3, 1);
    doBranch(selcell)

}








