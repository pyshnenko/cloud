import IndexPage from '../src/frontDesign/indexPage';
import Head from 'next/head';

export default function Index () {
    return (
        <div>
            <Head>
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <IndexPage />
        </div>
    )
}