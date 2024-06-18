import redisClient from './utils/redis';

(async () => {
    console.log(redisClient.isAlive());
    console.log(await redisClient.get('myKey'));
    await redisClient.set('myKey', 12, 5);
    console.log(await redisClient.get('myKey'));
    await redisClient.del('auth_f711adb4-1809-4ae7-974e-85e0ff4532bb');
    setTimeout(async () => {
        console.log(await redisClient.get('myKey'));
    }, 1000*10)
})();
