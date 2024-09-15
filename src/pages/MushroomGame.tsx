import { useRef, useState, useEffect } from 'react';
import { IRefPhaserGame, PhaserGame } from '../game/PhaserGame';
import { MainMenu } from '../game/scenes/MainMenu';
import { auth , db} from "../firebase.ts";
import { doc, getDoc, setDoc } from 'firebase/firestore';
import Auth from '../game/Authentication.tsx';
import { onAuthStateChanged } from 'firebase/auth';

function MushroomGame() {
    const [user, setUser] = useState<string | any>(null);
    const [userCoins, setUserCoins] = useState<number | 0>(0);
    const [userMushrooms, setUserMushrooms] = useState<number | 0>(0);
    const [userCards, setUserCards] = useState<string []>([]);
    const [gameData, setGameData] = useState();

    useEffect(() => {
        inventory();
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        setUser(user)});
    return () => unsubscribe();
    }, []);

    useEffect(() => {
        // Auto-save game progress every 30 seconds
        const autoSaveInterval = 5000;
        const intervalId = setInterval(() => {
          saveGameProgress(user.uid, gameData);
    }, autoSaveInterval);
        return () => clearInterval(intervalId); // Cleanup on component unmount
      }, [gameData]);

      async function saveGameProgress(user: string, gameData: any) {
        try {
          await setDoc(doc(db,'game-data', user), gameData);
          console.log('Game progress saved successfully.');
        } catch (error) {
          console.error('Error saving game progress:', error);
        }
      }

    
    const inventory = async () => {
        let userInventory = {
            coins: userCoins,
            mushrooms: userMushrooms,
            cards: userCards
        }
        setGameData(userInventory);
    } 
    
    console.log(gameData)
  
  
    useEffect(() => {
        console.log(userCoins);
        console.log(userMushrooms);
        console.log(userCards);
    },)
    // The sprite can only be moved in the MainMenu Scene
    const [canMoveSprite, setCanMoveSprite] = useState(true);

    //  References to the PhaserGame component (game and scene are exposed)
    const phaserRef = useRef<IRefPhaserGame | null>(null);
    const [spritePosition, setSpritePosition] = useState({ x: 0, y: 0 });

    const changeScene = () => {

        if(phaserRef.current)
        {     
            const scene = phaserRef.current.scene as MainMenu;
            
            if (scene)
            {
                scene.changeScene();
            }
        }
    }

    const moveSprite = () => {

        if(phaserRef.current)
        {

            const scene = phaserRef.current.scene as MainMenu;

            if (scene && scene.scene.key === 'MainMenu')
            {
                // Get the update logo position
                scene.moveLogo(({ x, y }) => {

                    setSpritePosition({ x, y });

                });
            }
        }

    }

    const addSprite = () => {

        if (phaserRef.current)
        {
            const scene = phaserRef.current.scene;

            if (scene)
            {
                // Add more stars
                const x = Phaser.Math.Between(64, scene.scale.width - 64);
                const y = Phaser.Math.Between(64, scene.scale.height - 64);
    
                //  `add.sprite` is a Phaser GameObjectFactory method and it returns a Sprite Game Object instance
                const star = scene.add.sprite(x, y, 'star');
    
                //  ... which you can then act upon. Here we create a Phaser Tween to fade the star sprite in and out.
                //  You could, of course, do this from within the Phaser Scene code, but this is just an example
                //  showing that Phaser objects and systems can be acted upon from outside of Phaser itself.
                scene.add.tween({
                    targets: star,
                    duration: 500 + Math.random() * 1000,
                    alpha: 0,
                    yoyo: true,
                    repeat: -1
                });
            }
        }
    }

    // Event emitted from the PhaserGame component
    const currentScene = (scene: Phaser.Scene) => {

        setCanMoveSprite(scene.scene.key !== 'MainMenu');
        
    }

    return (
        <>
        <div>
            {user ? (
                <div className='flex justify-between mx-5 my-2'>
                    <h1 className='font-thin font-roboto'>Welcome, {user.name || user.email}</h1>
                    <button className='bg-gray-400 rounded-md p-1' onClick={() => auth.signOut()}>Sign Out</button>
                </div>
            ) : (<Auth />)}
        </div>
        
        <div id="game-container" className='w-full flex align-center m-12 mx-auto'>
            <PhaserGame ref={phaserRef} currentActiveScene={currentScene} 
                setUserCoins={setUserCoins}
                setUserMushrooms={setUserMushrooms}
                setUserCards={setUserCards}
            />
            <div>
                <div>
                    <button className="button" onClick={changeScene}>Change Scene</button>
                </div>
                <div>
                    <button disabled={canMoveSprite} className="button" onClick={moveSprite}>Toggle Movement</button>
                </div>
                <div className="spritePosition">Sprite Position:
                    <pre>{`{\n  x: ${spritePosition.x}\n  y: ${spritePosition.y}\n}`}</pre>
                </div>
                <div>
                    <button className="button" onClick={addSprite}>Add New Sprite</button>
                </div>
            </div>
        </div>
        </>
    )
}

export default MushroomGame
