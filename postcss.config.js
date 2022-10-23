module.exports = {
    plugins: {
        'postcss-px2rem-exclude': {
            remUnit: 23.4375, //结果为：设计稿元素尺寸/16，比如元素宽320px,最终页面会换算成 20rem
            exclude: /node_modules|folder_name/i //屏蔽node_modules里的css，使用postcss-px2rem不能屏蔽，所以会导致引入的一些ui变形
        }
    }
};