// src/theme/Layout.js
import React from 'react';
import Layout from '@theme-original/Layout';
import FixedBanner from "../components/FixedBanner";
export default function LayoutWrapper(props) {
    return (
        <>
            <Layout
                {...props}
            >
                <FixedBanner />
                {props.children}
            </Layout>
        </>
    );
}