
//=====下载文件============================================
function saveDataToFile(flatData, filename = 'myFlat.json') {
    const jsonStr = JSON.stringify(flatData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });

    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();

    URL.revokeObjectURL(a.href);
}

//--- 矩阵转成扁平 ------------
function matrorixToFlat(matrorixData){
    const flat=[];
    matrorixData.forEach(yitem =>{
        yitem.forEach(xitem=>{
            flat.push({                         //转为扁平对象数组
                "id":xitem.id,
                "name":xitem.name,
                "ord":xitem.ord,
                "ico":xitem.ico,
                "DEP":xitem.DEP,                //数据录入人
                "pf":xitem.pf,                 //简介
                "parentId": xitem.parentId});
        })
    })
    return flat;
}


//%%%%%%%%%%%%%%%%%%%%%%%%%%%
//%%%%%%%%%%%%%%%%%%%%%%%%%%%

function toEle(row,col){
    try{
        return table[row][col];
    }catch(err){
        return null;
    }    
};

function hasKey(cell,key){
    try{
        return Object.hasOwn(cell,key)
    }catch(err){
        return false;
    }
};

function hasKp(cell){   //有父键
    return hasKey(cell,"parent")  
};

function hasKc(cell){   //有子键
    return hasKey(cell,"children")
};

//中心的左边,从细到大看>>右邻居
function rNeig(cell){
    let x = cell.x;
    let ele = toEle(cell.row,cell.col + 1);    
    while (x < 0 && hasKc(ele) == 0){
        x += csp;
        ele = toEle(ele.row,ele.col + 1);        
    }
    if(x >= 0) x = -0.5*csp;
    return x
};

//中心的右边,从大到细>>看左邻居
function lNeig(cell){       //单元格在右边
    let x = cell.x;
    let ele = toEle(cell.row,cell.col - 1);
    while (x > 0 && hasKc(ele) == 0){
        x -= csp;
        ele = toEle(ele.row,ele.col - 1);
    }
    if(x <= 0) x = 0.5*csp;
    return x
};

// function isBigg(cell){
//     try{
//         return cell.id == cell.parent().children[0].id;
//     }catch(err){
//         if(err.name == "TypeError") return true;
//         else return false;
//     }
// };

// function isSmall(cell){
//     try{
//         const p=cell.parent();
//         return cell.id == p.children[p.children.length-1].id;
//     }catch(err){
//         if(err.name == "TypeError") return true;
//         else return false;
//     }
// };


function parent(cell){
    try{
       return cell.parent(); 
    }catch(err){        
        return null;
    }
};

function children(cell){
    try{
        return arr=cell.children;
    }catch(err){
        return null;
    }
};

function childcoor(cell){
    try{
       return {X1:cell.children[0].x, X2:cell.children[cell.children.length-1].x,Y1:cell.children[0].y};
    }catch(err){
        return {X1:empty,X2:empty,Y1:empty}
    }
};

function parentSel(cell){
    try{
        const ps=cell.parent(cell).sel;
        if(ps==16 || ps==1) return 1;
        return -100;
    }catch(err){
        return 0;
    }
};

function doUp(cell){  
    if(!cell) return;
    cell.x=0;
    cell.sel = 2;
    
    let cnt=0;      //向左设置数据
    for(let i = cell.col - 1; i >= 0;i--){
        const ele = toEle(cell.row,i);
        cnt++;
        ele.x = cell.x - cnt * csp;
        ele.sel = 0;
    }

    cnt=0;      //向右设置数据
    for(let i = cell.col + 1; i < table[cell.row].length; i++){
        const ele = toEle(cell.row,i);
        cnt++;
        ele.x =cell.x + cnt * csp;
        ele.sel = 0;
    } 

    doUp(parent(cell));
};


function myPcs(cell){//我父亲有多少个子
    try{
        return cell.parent().children.length;
    }catch(err){
        return 1
    }
};

function myCs(cell){ //我有多少个子
    try{
        return cell.children.length;
    }catch(err){
        return 0;
    }
};

function myBcs(cell,no){ //我某个兄弟有多少个子
    try{
        const p=cell.parent();
        let i=0;
        let len=p.children.length;
        while(i<len){
            if(p.children[i] == cell){
                if(i + no >= 0 && i + no < len){
                    if(hasKey(p.children[i+no]),"children"){
                        return p.children[i+no].children.length;
                    } return 0;
                } else return -1;
            }; 
            i++;
        }
        return -1;
    }catch(err){
        return 0;
    }
};

//-----------------------------------------------------------------------------------------
function doCenter(cell){//奇数-->> 先中心后左右左右向外执行,偶数-->> 先里层左右后左右左右向外执行
    let len = myCs(cell)
    let idx = parseInt((len - 1) /2);
    let parity = len % 2 == 1 ? 1:-1;   //parity 奇=1;偶=-1
    let xSt = parity==1? 0:-0.5 * csp
    let base = 0;
    let i = 0;
    let res = {R:cell.row, C:cell.col,X:cell.x}
    let res2 = res;

    while(i < len && !quit){        
        idx = idx + base * parity;
        //------------------------
        res2=doDown(cell.children[idx],xSt);
        if(res2.R > res.R){
            res = res2;
            if(res.R >= rowcount - 1){
                quit = true;
                break; //break outerLoop; // 跳出到outerLoop标签指定的位置
            }
        }        
        //------------------
        base++;
        parity = parity * (-1);
        i++;
    }
    return res;
};

//中心的左边,从细到大看>>右邻居
function doTail(cell){
    let res = {R:cell.row, C:cell.col,X:cell.x}
    let res2 = res;
    let len = myCs(cell);
    let xp=rNeig(cell);//从细到大看>>右邻居

    if(myBcs(cell,1) == 0 )xp=0;
    if(myBcs(cell,2) > 0 ) xp = -0.5*csp;

    for(let i = len-1; i >= 0; i--){
        res2=doDown(cell.children[i],xp);
        if(res2.R > res.R){
            res = res2;
            if(res.R >= rowcount - 1){
                quit = true;
                break; //break outerLoop; // 跳出到outerLoop标签指定的位置
            }
        } 
    }
    return res;
};

//中心的右边,从大到细>>看左邻居
function doHead(cell){
    let res = {R:cell.row, C:cell.col,X:cell.x}
    let res2 = res;
    let len = myCs(cell);
    let xp=lNeig(cell);//从大到细>>看左邻居
    if(myBcs(cell,-1) == 0)xp=0;
    if(myBcs(cell,-2) > 0 ) xp = 0.5*csp;

    for(let i = 0; i < len; i++){
        res2=doDown(cell.children[i],xp);
        if(res2.R > res.R){
            res = res2;
            if(res.R >= rowcount - 1 ){
                quit = true;
                break; //break outerLoop; // 跳出到outerLoop标签指定的位置
            }
        } 
    }
    return res;
};

function doDown(cell,x){ // x 是必须参数     
  
    if(cell==null) return {R:-1, C:-1, X:-1}; 

    if(cell.sel == empty) cell.sel = parentSel(cell);
 
    if(cell.x == empty) cell.x = x;

    let cnt=0;          //向左设置数据
    for(let i = cell.col - 1; i >= 0;i--){
        const ele = toEle(cell.row,i);
        cnt++;
        ele.x = cell.x - cnt * csp;
        if(ele.sel==empty)ele.sel = parentSel(ele);
    }

    cnt=0;              //向右设置数据
    for(let i = cell.col + 1; i < table[cell.row].length; i++){
        const ele = toEle(cell.row,i);
        cnt++;
        ele.x =cell.x + cnt * csp;
        if(ele.sel==empty)ele.sel = parentSel(ele);
    } 
   

    let res={R:cell.row, C:cell.col, X:cell.x};   
    if(myCs(cell)== 0) return res;                          //没有后代返回

    if(cell.x == 0) res = doCenter(cell);                   //第一种场景 
        
    else if(cell.x <= - 0.5 * csp)res = doTail(cell);       //第二种场景 = 从细到大 
        
    else if(cell.x >=  0.5 * csp)res = doHead(cell);        //第三种场景 = 从大到细 
        
  
    return res;
};

function selectDown(cell){
    if(cell == null) return;
    const {R,C,X} = doDown(cell,cell.x);
 
    if(R >= rowcount - 1){ quit=true; return }; 


    let i=C-1;
    while(i >= 0 && toEle(R,i).sel >=1 ) i--;
    if(i>=0){
        const ele=toEle(R,i);
        selectDown(ele);    
    } else{
        i=C+1;
        while(i < table[R].length && toEle(R,i).sel >=1) i++;
        
        if(i< table[R].length) {
            const ele = toEle(R,i);
            selectDown(ele);   
        }
    };
};


//===== 初始化数据 =====
function iniTable(){
    rowcount = table.length;
    for(let j = 0;j < rowcount;j++){
        for(let i = 0;i < table[j].length;i++){
            let obj= table[j][i];
            obj.row = j;
            obj.col = i;
            obj.x = empty;
            obj.y = sumrsp(j)
            obj.sel = empty;
        }
    }
};

function getLim(){
    // 光标上移,也是图表上移,做底限,dy<0 累积dys最终<0;
    // 此时:
    // 底数据(>0)+dys(<=0) = 屏幕底(>0)- 保护
    // 此时的dys为底限uLim(不小于此值)
    // 底数据 + bLim = 屏幕底 - 保护
    // bLim = 屏幕底 - 保护 - 底数据
    // bLim=190 -10 -780 = -600 

    // 光标下移,也是图表下移,做顶限,dy>0 累积dys最终>=0;
    // 此时:
    // 顶数据(=0)+dys(>0) = 屏幕顶(<0)+ 保护
    // 此时的dxs为顶限tLim(不大于此值)
    // 顶数据 + tLim= 屏幕顶 + 保护
    // tLim= 屏幕顶 + 保护 - 顶数据
    // tLim= -10 +10 -0 = 0 
    // dys取值范围:  顶限不大于0...底限不小于-600 

    // ------------------------------------
    // 光标左移,也是图表左移,做右限,dx<0,累积dxs最终<0;
    // 此时:
    // 右数据(>=0)+dxs(<0) = 屏幕右(>0)- 保护
    // 此时的dxs为右限rLim(不小于此值)
    // 右数据 + rLim = 屏幕右 - 保护
    // rLim = 屏幕右 - 保护 - 右数据 *************** 正常<0 特殊>0 ***************************
    // rLim = 45 -10 - 155 = -120

    // 光标右移,也是图表右移,做左限,dx>0,累积dxs最终>0;
    // 此时:
    // 左数据(<=0)+dxs(>0) = 屏幕左(<0)+保护
    // 此时的dxs为左限 lLim(不大于此值)
    // 左数据 + lLim = 屏幕左 + 保护 
    // lLim = 屏幕左 + 保护 - 左数据 **************** 正常>0 特殊<0 **************************
    // lLim = -45 + 10 - (-155) = 120    

    // dxs取值范围:  左限不大于120...右限不小于-120


    transx=0;
    transy=0;
    xrate = 0.5;

    bLim = cheight - 2*safe - (rowcount * rsp - 2*fonth);
    tLim = 0;

    let lx=0;
    let rx=0;

    for(let j = 0 ;j < rowcount;j++){
        let len = table[j].length - 1;
        if(len>=0){
            if(lx > table[j][0].x ) lx = table[j][0].x ;
            if(rx < table[j][len].x ) rx = table[j][len].x;
        }    
    }   
    
    if(rx + Math.abs(lx)>0) xrate = (Math.abs(lx)/(rx + Math.abs(lx))).toFixed(4)
    else xrate=0.5;

    lLim = - orix() + 1.5*safe - lx;        //********  正常 >0 特殊<0 ***********
    rLim = cwidth - orix() - 1.5*safe - rx; //********  正常 <0 特殊>0 ***********

    if(selcell != null && lx < 0 && rx > 0){
        if(lx > -0.5*cwidth + 1.5*safe) transx = -lx;
        else if(rx < 0.5*cwidth - 1.5*safe) transx = -rx;
        else transx = 0.5*cwidth - orix();   

        // console.log(`lx=${lx}  rx=${rx}  屏左=${- 0.5*cwidth +1.5*safe} 屏右=${ 0.5*cwidth -1.5*safe}  屏右=${cwidth - orix()}  transx=${transx} `)    
    } 

};


function doPositioning(cell){
    if(cell==null) return;
    quit=false;         //初始化向下搜索退出机制
    iniTable();    
    cell.sel=16;
    cell.x=0;
    doUp(parent(cell));
    selectDown(cell);
    getLim();
    doTrans(0,rsp - cell.y)
    
}

