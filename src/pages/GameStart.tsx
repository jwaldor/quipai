import React, { useState } from 'react';
import { GameState, MAX_NUM_OF_USERS } from '../App';
import { FunnySprites} from './DisplayUsers'; // Assuming FunnySprites is exported from DisplayUsers


const GameStart: React.FC<{gameState: GameState}> = ({ gameState }) => {
  const { users } = gameState;

  const paddedUsers = [...users, ...Array(MAX_NUM_OF_USERS - users.length).fill(undefined)]

  const [newUser, setNewUser] = useState('')

  const handleAddNewUser = () => {
    console.log('adding new usre')
  }


  return (
    <div className="h-screen bg-gradient-to-br from-blue-600 to-cyan-400 mx-auto">
      <div className='flex justify-center w-full pt-8'> 

      <h1 className="text-4xl font-bold text-white mb-8">Game Lobby</h1>
      </div>
      <div className="relative w-[70vw] h-[70vh] max-w-[700px] max-h-[700px] mx-auto">
        {paddedUsers.map((user, index) => {
          const angle = (index / MAX_NUM_OF_USERS) * 2 * Math.PI;
          const radius = Math.min(200, window.innerWidth * 0.4, window.innerHeight * 0.4);
          const left = `calc(50% + ${radius * Math.cos(angle)}px)`;
          const top = `calc(50% + ${radius * Math.sin(angle)}px)`;
          const size = Math.min(80, window.innerWidth * 0.1, window.innerHeight * 0.1);
          return (
            <div 
              key={index} 
              style={{ 
                position: 'absolute', 
                left, 
                top, 
                transform: 'translate(-50%, -50%)',   
                width: `${size}px`,
                height: `${size}px`,
              }}
            >
              {user ? (
                <FunnySprites sprite_id={user.sprite_id} name={user.name} score={user.score} />
              ) : (
                <EmptyUserSprite />
              )}
            </div>
          );
        })}
      </div>

      <form onSubmit={handleAddNewUser} className="w-full max-w-md flex mx-auto justify-center">
        <input 
          type="text" 
          onChange={(e) => {
            setNewUser(e.target.value)
          }} 
          placeholder='Enter your name ... '
          className='flex-grow px-4 py-2 rounded-l-full border-2 border-blue-300 focus:outline-none focus:border-blue-500'
        />
        <button 
          type="submit"           
          className="bg-blue-500 text-white px-4 py-2 rounded-r-full hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
        >
          Join game

        </button>
      </form>

      
    </div>
  );
};
const EmptyUserSprite: React.FC = () => {
  return (
      <FunnySprites name='Empty' empty sprite_id={0} score={undefined}/>
  );
};

export default GameStart;
