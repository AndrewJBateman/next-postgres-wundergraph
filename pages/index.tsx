import {NextPage} from "next";
import styles from "../styles/Home.module.css"

const Home: NextPage = () => {
    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Hello WunderGraph!</h1>
        </div>
    )
}

export default Home;