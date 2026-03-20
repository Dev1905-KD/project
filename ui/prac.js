class Main{
    b=10;
    addNumbers(a,b){
        console.log(b);
        console.log(this.b);
        let sum =a+b;
        return sum;
    }
}

let n1=25;
let n2=15;
let obj = new Main();
result = obj.addNumbers(n1,n2);
console.log("Sum is :"+ result);