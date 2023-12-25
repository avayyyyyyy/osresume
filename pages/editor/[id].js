import { RedirectToSignIn, SignedIn, SignedOut, useAuth } from '@clerk/nextjs';
import { useMediaQuery } from '@material-ui/core';
import axios from 'axios';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { useEffect, useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';
import LeftSideBar from '../../components/LeftSideBar';
import Loader from '../../components/Loader';
import RightSideBar from '../../components/RightSideBar';
import { ResumeNotFoundSVG } from '../../components/SVGs';
import Onyx from '../../components/templates/Onyx';
import Trical from '../../components/templates/Trical';

import addFontInHeadTag from '../../shared/utils/addFontInHeadTag';
import { adddata } from '../../zustand/zustand';

const Editor = () => {
  const { getToken } = useAuth();
  // const dispatch = useDispatch();
  const router = useRouter();
  const desktop = useMediaQuery('(min-width:1024px)');
  const alll = adddata(state => state.data);

  // const resume = useSelector(state => state.resume);

  //const { data: resumeData, metadata } = resume;
  const resumeRef = useRef();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { title } = adddata(state => state.data.resumemetadata);
  const { username } = adddata(state => state.data.personaldata);
  const addexperiencedata = adddata(state => state.addexperiencedata);
  const addextradata = adddata(state => state.addextrasdata);

  const addpersonaldata = adddata(state => state.addpersonaldata);
  const personaldata = adddata(state => state.data.personaldata);
  const educationdata = adddata(state => state.addeducationdata);
  const eductainvalues = adddata(state => state.data.educationdata);
  const experiencedata = adddata(state => state.data.experiencedata);
  const extrasdata = adddata(state => state.data.extrasdata);
  const addmetadata = adddata(state => state.addresumemetadata);

  const handlePrint = useReactToPrint({
    documentTitle: title || 'Your Resume',
    content: () => resumeRef.current,
    /* eslint-disable no-tabs */
    pageStyle: `
			@page {
				margin: 0;
				padding: 0;
				overflow: hidden;
				height: 0; 
			}
			@media print {
				footer {display: none;}
				header {display: none;}
				html,body {
					overflow: hidden;
					border: 1px solid white;
					height: 100%;
					page-break-after: avoid;
					page-break-before: avoid;
					margin:0;
					padding:0;
					font-size: 100%;
				}
			}
			`,
  });

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const token = await getToken();
        const { data } = await axios({
          url: `/api/resumes/${router.query.id}`,
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        // console.log(data);
        const personalData = data.resume.personal
          ? data.resume.personal
          : { name: '', email: '', phoneNumber: '', designation: '', country: '', objective: '' };
        addmetadata({
          title: data.resume.title,
          createdAt: data.resume.createdAt,
          resumeId: data.resume._id,
          userId: data.resume.userId,
          templateName: data.resume.templateName,
          customStyles: data.resume.customStyles,
        });
        //    dispatch(
        //    addResumeMetaData({
        //     title: data.resume.title,
        //   createdAt: data.resume.createdAt,
        //       resumeId: data.resume._id,
        //       userId: data.resume.userId,
        //      templateName: data.resume.templateName,
        //    customStyles: data.resume.customStyles,
        //     }),
        // );

        // dispatch(addExperienceData(data.resume.experience));
        // dispatch(addExtrasData(data.resume.extras));
        // dispatch(addPersonalDataState(personalData));
        // dispatch(addEducationData(data.resume.education));
        educationdata(data.resume.education);
        addexperiencedata(data.resume.experience);
        addpersonaldata(personalData);
        addextradata(data.resume.extras);

        const fontID = data.resume.customStyles.font.replace(/ /g, '+');
        addFontInHeadTag(fontID);
      } catch (error) {
        // console.log(error);
        setError(true);
      } finally {
        setLoading(false);
      }
    })();
  }, [router.query.id]);

  const render = () => {
    if (loading) {
      return <Loader fullScreen />;
    }
    if (error) {
      return (
        <div className="p-10 flex flex-col items-center justify-center" style={{ height: '90vh' }}>
          <ResumeNotFoundSVG width="50%" />
          <h5 className="text-default mt-6 font-normal text-xl">
            The Resume you are looking for is <span className="bg-primary text-white"> no longer available </span> or you
            <span className="bg-primary text-white"> don&apos;t have the permission </span>to view it.
          </h5>
        </div>
      );
    }
    if (desktop) {
      return (
        <div className="flex flex-col lg:flex-row bg-gray-50">
          <LeftSideBar />
          <div className="order-2 mx-auto my-10">
            {alll.resumemetadata.templateName === 'Onyx' && (
              <Onyx data={{}} ref={resumeRef} customStyles={alll.resumemetadata.customStyles} />
            )}
            {alll.resumemetadata.templateName === 'Trical' && (
              <Trical
                ref={resumeRef}
                extrasdata={extrasdata}
                perosnaldata={personaldata}
                educationdata={eductainvalues}
                customStyles={alll.resumemetadata.customStyles}
                experiencedata={experiencedata}
              />
            )}
          </div>
          <RightSideBar handlePrint={handlePrint} />
        </div>
      );
    }
    return (
      <div className="flex items-center justify-center" style={{ minHeight: '91vh' }}>
        Please switch to desktop for better experience.
      </div>
    );
  };

  return (
    <>
      <Head>
        <title>{username ? `${username} | OS Resume` : 'Resume Editor | OS Resume'}</title>
      </Head>
      <SignedIn>{render()}</SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
};

export default Editor;
