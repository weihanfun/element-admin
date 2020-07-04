const obj = {
    name:'李四',
    age: 12
}

const fn = function(a){
    a.age = 22
}

fn(obj)

console.log(obj);


