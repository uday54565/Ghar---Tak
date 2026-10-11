

//  function calFact(  nums) {

//     if( nums == 0 || nums == 1){

//         return nums;
//     }
  

//     return calFact( nums-1)+calFact(nums-2);
    
// }
// console.log(calFact(10));


function calFact(nums) {
    if (nums == 0 || nums == 1) {
        return 1;
    }
    return  nums *calFact(nums - 1);
}

console.log(calFact(5)); // 8
