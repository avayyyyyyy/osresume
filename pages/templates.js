import { useAuth } from '@clerk/nextjs';
import { Button } from '@material-ui/core';
import axios from 'axios';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Script from 'next/script';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { ErrorSVG, NoFilesFoundSVG } from '../components/SVGs';
import TemplateCard from '../components/cards/TemplateCard';
import { toastMessages } from '../shared/contants';

const Templates = () => {
  const router = useRouter();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [noTemplate, setNoTemplate] = useState(false);
  const { getToken } = useAuth();

  const onSelect = id => {
    try {
      window.fbq('trackCustom', 'template-changed', {
        template: id,
      });
    } catch (e) {
      console.log(e);
    }
    setSelectedTemplate(id);
  };

  const onCancel = () => {
    setSelectedTemplate('');
  };

  const showSnack = (message, variant) => {
    if (variant === 'success') {
      toast.success(message);
    } else if (variant === 'error') {
      toast.error(message);
    } else if (variant === 'default') {
      toast.message(message);
    } else if (variant === 'info') {
      toast.info(message);
    }
  };
  const onCreate = async () => {
    try {
      window.fbq('trackCustom', 'resume-create', {
        template: selectedTemplate.templateName,
      });
    } catch (e) {
      console.log(e);
    }
    try {
      showSnack(toastMessages.CREATE_RESOURCE_REQUEST('Resume'), 'default');
      const token = await getToken();
      const { data } = await axios({
        url: '/api/resumes',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        data: {
          templateName: selectedTemplate.templateName,
          title: 'Your Resume',
        },
      });
      showSnack(toastMessages.CREATE_RESOURCE_SUCCESS('Resume'), 'success');
      router.push(`/editor/${data.data.id}`);
    } catch (error) {
      showSnack(toastMessages.CREATE_RESOURCE_ERROR('Resume'), 'error');
    }
  };

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const token = await getToken();
        const { data: res } = await axios({
          url: '/api/resumes?template=true',
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setTemplates(res.data);
        if (!res.data.length) {
          setNoTemplate(true);
        }
      } catch (e) {
        setNoTemplate(true);
        setError('An error occurred. Please try again later!');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const render = () => {
    if (loading) {
      return Array.from(Array(4).keys()).map(loader => <div key={loader} className="h-[462px] animate-pulse bg-[#e0e5ebd6] rounded-lg" />);
    }
    if (error) {
      return (
        <div className="p-10 flex flex-col items-center justify-center bg-gray-50 col-span-full h-96">
          <ErrorSVG width="100%" />
          <h5 className="text-default mt-6 font-normal text-xl">{error}</h5>
        </div>
      );
    }
    if (!templates.length) {
      return (
        <div className="bg-primary flex flex-col items-center justify-center flex-1 col-span-full -mt-10 -mb-10 -mx-10 lg:-mt-0 lg:-mx-0">
          <NoFilesFoundSVG width={200} height={300} />
          <h5 className="text-white text-xl font-medium pb-10 lg:ml-6">No Templates Found.</h5>
        </div>
      );
    }
    return templates.map(template => (
      <TemplateCard
        template={template}
        type="TEMPLATE"
        selected={template._id === selectedTemplate._id}
        onSelect={onSelect}
        key={template._id}
      />
    ));
  };

  return (
    <div className="py-12 lg:max-w-screen-xl mx-auto">
      <Head>
        <title>Templates | OS Resume</title>

      </Head>
      <Script
        id="meta-pixel"
        dangerouslySetInnerHTML={{
          __html: `
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '253902167786104');
fbq('track', 'PageView');
`,
        }}
      />
      {/* Noscript fallback for Meta Pixel */}
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: 'none' }}
          src="https://www.facebook.com/tr?id=253902167786104&ev=PageView&noscript=1"
        />
      </noscript>
      <h1 className="text-3xl lg:text-5xl font-extralight text-center pb-10">Browse All Templates</h1>

      {!noTemplate && (
        <div className="bg-gray-50 rounded px-8 py-6 transition-all flex flex-col lg:flex-row items-center justify-between">
          <h2 className="text-regular text-lg font-medium text-default">
            {`${selectedTemplate ? `Selected Template : ${selectedTemplate.title}` : 'Select a Template'}`}
          </h2>
          <div className="mt-6 lg:mt-0">
            {selectedTemplate && (
              <>
                <Button className="mr-10" variant="outlined" color="primary" onClick={onCancel}>
                  Cancel
                </Button>
                <Button variant="outlined " className=" text-white hover:bg-[#12836d]  bg-primary" color="primary" onClick={onCreate}>
                  Create
                </Button>
              </>
            )}
          </div>
        </div>
      )}
      <div className="pt-10 px-10 lg:px-0 templates-grid-container">{render()}</div>
    </div>
  );
};

export default Templates;
