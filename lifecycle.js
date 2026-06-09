

//======= 扁平转成宝塔 =======
function FlatToTree(flatList) {
    //---删除不必要的键
    function clrArrKey(obj,key){
        if(!Array.isArray(obj[key]))return;
        obj[key].splice(0);
        delete obj[key];    
    };
    //---建立映射表
    const idMapping= flatList.reduce((acc, item, index) => {
        clrArrKey(item,"childId");//--->在这里删除childId键
        let key=item.id;
        acc[key] = index;
        return acc;
    }, {});

    //---下面重点
    tree.splice(0);
    flatList.forEach(item => {
        // 判断根节点
        if (item.parentId ==="ROOT" || !item.parentId ) {
            // root.parent = null; //返回父辈这空
            tree.push(item);
            return;
        }
        // 用映射表找到父元素
        const parentEl = flatList[idMapping[item.parentId]];
        // 用函数指到父元素 !!!!! 在下面加入了一条函数指向父(parent) !!!!!重要重要重要
        item.parent = function(){return parentEl};
        // 把当前元素添加到父元素的`children`数组中
        // parentEl.children = [...(parentEl.children || []), item];这句等于下面两句
        if(!parentEl.children) parentEl.children = [item]
        else parentEl.children.push(item)                   //这句在原数组执行

    });
}


//=====宝塔转矩阵======
function treeToMatrorix() {
    function add(level,arr){
        while(table.length < (level + 1)) table.push([]);
        arr.forEach(obj =>{
            table[level].push(obj)
        });
    };

    table.splice(0);

    function walk(nodes, level = 0) {        
        if (!isArr(nodes))return;
        add(level,nodes);        
        nodes.forEach(node => walk(node.children,level + 1));   //重要!!!     
    }
    walk(tree);
}

//%%%% 数据加载 %%%%%%%%%%%%%%%%%%%
function loadData(){
    return fetch('./data/data.dat')   //一定要加return
    .then(res => res.json())            // 将响应解析为 JSON 对象
    .then(resdata =>{ 
        FlatToTree(resdata);            //营造树形数据(宝塔图) 
        treeToMatrorix(tree);             //营造矩阵(平面坐标图) 
    })
    .catch(error => {
        console.error('Error:', error); // 捕获错误
    });
}

//%%%%%% 窗口尺寸更改 %%%%%%%%


let hDealy = null; //---定时头

function doDebounce() {
    if(hDealy) return;
    hDealy  = setTimeout(() => {
        clearTimeout(hDealy );
        hDealy = null;
        resizeCanvas("resize");
        prepare();  
    }, 100);
}

//-----将屏幕坐标转换为 canvas 坐标 
function toCanvasPos(event) {
    const rect = canvas.getBoundingClientRect();
    // 计算缩放比例
    // const scaleX = canvas.width / rect.width;
    // const scaleY = canvas.height / rect.height;
    // 最终真实坐标
    return {
        x:parseInt((event.clientX - rect.left)),
        y:parseInt((event.clientY - rect.top))
    }
}

let moveing=false;
let Dealy2=null;



//%%%%%%% 加载画板监听 %%%%%%%%%%%%%%%%%%
function loadListen(){    
    //-----点击 
    canvas.addEventListener('click', (e) => {
        if(moveing)return;
        const { x,y } = toCanvasPos(e);
        onCanvasClick(x,y); 
    });
    //----- 鼠标移动 
    canvas.addEventListener('mousemove', (e) => {
        const {x,y} = toCanvasPos(e);
        if(isDown){
            if(hDealy !=null)return;
            hDealy  = setTimeout(() => {
                clearTimeout(hDealy);
                hDealy = null;
                moveing=true;
            },50);
            onDownMove(x,y); 
        } else onMouseMove(x,y);
    });    
    //-----按下
    canvas.addEventListener('mousedown', (e) => {
        const { x,y } = toCanvasPos(e); 
        isDown=true; 
        onMouseDown(x,y);
        
    });
    //-----抬起
    canvas.addEventListener('mouseup', (e) => {
        const { x,y } = toCanvasPos(e); 
        isDown=false;
        if(moveing){
            Dealy2=setTimeout(() => {
                clearTimeout(Dealy2);
                Dealy2 = null;
                moveing=false;
            },200);
        } else {
            if(hDealy ){
                clearTimeout(hDealy);
                hDealy = null;
                moveing=false;
            }        
        } 
        onMouseUp(x,y);    
    }); 
    
    // 触摸开始
    canvas.addEventListener('touchstart', (e) => {
        // e.preventDefault();             // 禁止浏览器下拉/滚动冲突
        const touch = e.touches[0];
        const { x, y } = toCanvasPos(touch);
        isDown = true;
        onMouseDown(x, y);              // 复用你原来的函数
    });

    // 触摸移动
    canvas.addEventListener('touchmove', (e) => {
        e.preventDefault(); // 禁止页面滚动
        if (!isDown) return;
        
        const touch = e.touches[0];
        const { x, y } = toCanvasPos(touch);
        onDownMove(x, y); // 复用
    });
    // 触摸结束
    canvas.addEventListener('touchend', (e) => {
        isDown = false;
        onMouseUp(); // 复用
        });

        // 触摸取消（比如滑出屏幕）
        canvas.addEventListener('touchcancel', () => {
        isDown = false;
        onMouseUp();
    });


    //----- 窗口尺寸改变
    window.addEventListener('resize', doDebounce);

    resizeCanvas("direct");
    
}

//%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
//%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

document.addEventListener("DOMContentLoaded", async function(){ 
    await loadData();
    loadListen();
    prepare()//准备绘画
    
   
});


              











